import { Hono } from 'hono'
import type { Env } from '../index'
import type { PlayerProfile, PlayerTournamentHistory } from '@cedh-pox/shared'

const playersPublic = new Hono<{ Bindings: Env }>()

// GET / — global leaderboard: all players ranked by career total points
playersPublic.get('/', async (c) => {
  const db = c.env.DB

  const rows = await db
    .prepare(
      `SELECT
        p.id AS player_id,
        p.name AS player_name,
        COALESCE(SUM(me.points), 0) AS total_points,
        COALESCE(SUM(CASE WHEN me.result = 'win' THEN 1 ELSE 0 END), 0) AS wins,
        COALESCE(SUM(CASE WHEN me.result = 'draw' THEN 1 ELSE 0 END), 0) AS draws,
        COALESCE(SUM(CASE WHEN me.result = 'loss' THEN 1 ELSE 0 END), 0) AS losses,
        COALESCE(COUNT(CASE WHEN me.status = 'active' THEN 1 END), 0) AS matches_played,
        COUNT(DISTINCT m.tournament_id) AS tournaments_played
       FROM players p
       LEFT JOIN match_entries me ON me.player_id = p.id AND me.status = 'active'
       LEFT JOIN matches m ON m.id = me.match_id
       GROUP BY p.id, p.name
       ORDER BY total_points DESC, wins DESC`
    )
    .all<{
      player_id: number; player_name: string; total_points: number
      wins: number; draws: number; losses: number; matches_played: number; tournaments_played: number
    }>()

  const standings = rows.results.map((r, i) => ({ rank: i + 1, ...r }))
  return c.json(standings)
})

// GET /:id — player profile with career stats and per-tournament history
playersPublic.get('/:id', async (c) => {
  const db = c.env.DB
  const playerId = Number(c.req.param('id'))

  const player = await db
    .prepare('SELECT id, name, created_at FROM players WHERE id = ?')
    .bind(playerId)
    .first<{ id: number; name: string; created_at: string }>()
  if (!player) return c.json({ error: 'Player not found' }, 404)

  // Career aggregate stats (active entries only)
  const career = await db
    .prepare(
      `SELECT
        COALESCE(SUM(me.points), 0) AS total_points,
        COALESCE(SUM(CASE WHEN me.result = 'win' THEN 1 ELSE 0 END), 0) AS wins,
        COALESCE(SUM(CASE WHEN me.result = 'draw' THEN 1 ELSE 0 END), 0) AS draws,
        COALESCE(SUM(CASE WHEN me.result = 'loss' THEN 1 ELSE 0 END), 0) AS losses,
        COALESCE(COUNT(CASE WHEN me.status = 'active' THEN 1 END), 0) AS matches_played,
        COUNT(DISTINCT m.tournament_id) AS tournaments_played
       FROM match_entries me
       INNER JOIN matches m ON m.id = me.match_id
       WHERE me.player_id = ?`
    )
    .bind(playerId)
    .first<{ total_points: number; wins: number; draws: number; losses: number; matches_played: number; tournaments_played: number }>()

  // Per-tournament stats
  const tournamentStats = await db
    .prepare(
      `SELECT
        t.id AS tournament_id,
        t.name AS tournament_name,
        t.status AS tournament_status,
        t.created_at AS tournament_created_at,
        COALESCE(SUM(me.points), 0) AS total_points,
        COALESCE(SUM(CASE WHEN me.result = 'win' THEN 1 ELSE 0 END), 0) AS wins,
        COALESCE(SUM(CASE WHEN me.result = 'draw' THEN 1 ELSE 0 END), 0) AS draws,
        COALESCE(SUM(CASE WHEN me.result = 'loss' THEN 1 ELSE 0 END), 0) AS losses,
        COALESCE(COUNT(CASE WHEN me.status = 'active' THEN 1 END), 0) AS matches_played
       FROM match_entries me
       INNER JOIN matches m ON m.id = me.match_id
       INNER JOIN tournaments t ON t.id = m.tournament_id
       WHERE me.player_id = ?
       GROUP BY t.id
       ORDER BY t.created_at DESC`
    )
    .bind(playerId)
    .all<{
      tournament_id: number; tournament_name: string; tournament_status: string
      tournament_created_at: string; total_points: number; wins: number
      draws: number; losses: number; matches_played: number
    }>()

  // Commanders per tournament
  const commanders = await db
    .prepare(
      `SELECT DISTINCT m.tournament_id, me.commander_name
       FROM match_entries me
       INNER JOIN matches m ON m.id = me.match_id
       WHERE me.player_id = ? AND me.commander_name IS NOT NULL`
    )
    .bind(playerId)
    .all<{ tournament_id: number; commander_name: string }>()

  const commandersMap = new Map<number, string[]>()
  for (const row of commanders.results) {
    const list = commandersMap.get(row.tournament_id) ?? []
    list.push(row.commander_name)
    commandersMap.set(row.tournament_id, list)
  }

  // Compute rank per tournament (position of this player in each tournament's standings)
  const rankMap = new Map<number, number>()
  for (const t of tournamentStats.results) {
    const allStandings = await db
      .prepare(
        `SELECT p.id AS player_id, COALESCE(SUM(me.points), 0) AS pts, COALESCE(SUM(CASE WHEN me.result = 'win' THEN 1 ELSE 0 END), 0) AS wins
         FROM players p
         INNER JOIN match_entries me ON me.player_id = p.id AND me.status = 'active'
         INNER JOIN matches m ON m.id = me.match_id AND m.tournament_id = ?
         GROUP BY p.id
         ORDER BY pts DESC, wins DESC`
      )
      .bind(t.tournament_id)
      .all<{ player_id: number; pts: number; wins: number }>()
    const pos = allStandings.results.findIndex(r => r.player_id === playerId)
    rankMap.set(t.tournament_id, pos >= 0 ? pos + 1 : 0)
  }

  const tournaments: PlayerTournamentHistory[] = tournamentStats.results.map(t => ({
    tournament_id: t.tournament_id,
    tournament_name: t.tournament_name,
    tournament_status: t.tournament_status as 'active' | 'finished',
    rank: rankMap.get(t.tournament_id) ?? 0,
    total_points: t.total_points,
    wins: t.wins,
    draws: t.draws,
    losses: t.losses,
    matches_played: t.matches_played,
    commanders: commandersMap.get(t.tournament_id) ?? [],
  }))

  const profile: PlayerProfile = {
    id: player.id,
    name: player.name,
    created_at: player.created_at,
    career: {
      total_points: career?.total_points ?? 0,
      wins: career?.wins ?? 0,
      draws: career?.draws ?? 0,
      losses: career?.losses ?? 0,
      matches_played: career?.matches_played ?? 0,
      tournaments_played: career?.tournaments_played ?? 0,
    },
    tournaments,
  }

  return c.json(profile)
})

export default playersPublic
