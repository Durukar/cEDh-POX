import { Hono } from 'hono'
import type { Env } from '../index'
import type { LeaderboardEntry } from '@cedh-pox/shared'

const leaderboard = new Hono<{ Bindings: Env }>()

leaderboard.get('/', async (c) => {
  const db = c.env.DB

  // Aggregate per-player stats, excluding disband entries
  const statsResult = await db
    .prepare(
      `SELECT
        p.id AS player_id,
        p.name AS player_name,
        COALESCE(SUM(me.points), 0) AS total_points,
        COALESCE(SUM(CASE WHEN me.result = 'win' THEN 1 ELSE 0 END), 0) AS wins,
        COALESCE(SUM(CASE WHEN me.result = 'draw' THEN 1 ELSE 0 END), 0) AS draws,
        COALESCE(SUM(CASE WHEN me.result = 'loss' THEN 1 ELSE 0 END), 0) AS losses,
        COALESCE(COUNT(CASE WHEN me.status = 'active' THEN 1 END), 0) AS matches_played
      FROM players p
      LEFT JOIN match_entries me ON me.player_id = p.id AND me.status = 'active'
      GROUP BY p.id, p.name
      ORDER BY total_points DESC, wins DESC`
    )
    .all<{
      player_id: number
      player_name: string
      total_points: number
      wins: number
      draws: number
      losses: number
      matches_played: number
    }>()

  const rows = statsResult.results
  if (rows.length === 0) {
    return c.json([] as LeaderboardEntry[])
  }

  // Fetch all commanders used by these players
  const playerIds = rows.map((r) => r.player_id)
  const placeholders = playerIds.map(() => '?').join(', ')
  const commandersResult = await db
    .prepare(
      `SELECT DISTINCT player_id, commander_name
       FROM match_entries
       WHERE player_id IN (${placeholders}) AND commander_name IS NOT NULL`
    )
    .bind(...playerIds)
    .all<{ player_id: number; commander_name: string }>()

  // Build a map of player_id -> commanders[]
  const commandersMap = new Map<number, string[]>()
  for (const row of commandersResult.results) {
    const list = commandersMap.get(row.player_id) ?? []
    list.push(row.commander_name)
    commandersMap.set(row.player_id, list)
  }

  // Assemble final leaderboard with rank
  const leaderboardData: LeaderboardEntry[] = rows.map((row, index) => ({
    rank: index + 1,
    player_id: row.player_id,
    player_name: row.player_name,
    total_points: row.total_points,
    wins: row.wins,
    draws: row.draws,
    losses: row.losses,
    matches_played: row.matches_played,
    commanders: commandersMap.get(row.player_id) ?? [],
  }))

  return c.json(leaderboardData)
})

export default leaderboard
