import { Hono } from 'hono'
import type { Env } from '../index'
import type { Match, MatchEntry, StandingsEntry, Tournament } from '@cedh-pox/shared'

const tournaments = new Hono<{ Bindings: Env }>()

// GET / — list all tournaments, active first then by created_at desc
tournaments.get('/', async (c) => {
  const db = c.env.DB
  const rows = await db
    .prepare(
      `SELECT t.id, t.name, t.description, t.status, t.created_at,
              COUNT(m.id) AS match_count
       FROM tournaments t
       LEFT JOIN matches m ON m.tournament_id = t.id
       GROUP BY t.id
       ORDER BY CASE t.status WHEN 'active' THEN 0 ELSE 1 END ASC, t.created_at DESC`
    )
    .all<Tournament & { match_count: number }>()
  return c.json(rows.results)
})

// GET /:id — single tournament
tournaments.get('/:id', async (c) => {
  const db = c.env.DB
  const id = Number(c.req.param('id'))
  const row = await db
    .prepare(
      `SELECT t.id, t.name, t.description, t.status, t.created_at,
              COUNT(m.id) AS match_count
       FROM tournaments t
       LEFT JOIN matches m ON m.tournament_id = t.id
       WHERE t.id = ?
       GROUP BY t.id`
    )
    .bind(id)
    .first<Tournament & { match_count: number }>()
  if (!row) return c.json({ error: 'Tournament not found' }, 404)
  return c.json(row)
})

// GET /:id/matches — all matches for a tournament with entries
tournaments.get('/:id/matches', async (c) => {
  const db = c.env.DB
  const tournamentId = Number(c.req.param('id'))

  const tournament = await db
    .prepare('SELECT id FROM tournaments WHERE id = ?')
    .bind(tournamentId)
    .first<{ id: number }>()
  if (!tournament) return c.json({ error: 'Tournament not found' }, 404)

  const result = await db
    .prepare(
      `SELECT
        m.id, m.match_number, m.notes, m.played_at, m.tournament_id,
        me.id AS entry_id, me.player_id, me.commander_name, me.status, me.result, me.points,
        p.name AS player_name
       FROM matches m
       LEFT JOIN match_entries me ON me.match_id = m.id
       LEFT JOIN players p ON p.id = me.player_id
       WHERE m.tournament_id = ?
       ORDER BY m.match_number ASC, me.id ASC`
    )
    .bind(tournamentId)
    .all<{
      id: number; match_number: number; notes: string | null; played_at: string; tournament_id: number
      entry_id: number | null; player_id: number | null; commander_name: string | null
      status: 'active' | 'disband' | null; result: 'win' | 'draw' | 'loss' | 'none' | null
      points: number | null; player_name: string | null
    }>()

  const matchMap = new Map<number, Match>()
  for (const row of result.results) {
    if (!matchMap.has(row.id)) {
      matchMap.set(row.id, {
        id: row.id, match_number: row.match_number, notes: row.notes,
        played_at: row.played_at, tournament_id: row.tournament_id, entries: [],
      })
    }
    if (row.entry_id !== null) {
      const entry: MatchEntry = {
        id: row.entry_id, match_id: row.id, player_id: row.player_id!,
        player_name: row.player_name!, commander_name: row.commander_name,
        status: row.status!, result: row.result!, points: row.points!,
      }
      matchMap.get(row.id)!.entries.push(entry)
    }
  }
  return c.json(Array.from(matchMap.values()))
})

// GET /:id/standings — ranked player standings for a tournament
tournaments.get('/:id/standings', async (c) => {
  const db = c.env.DB
  const tournamentId = Number(c.req.param('id'))

  const tournament = await db
    .prepare('SELECT id FROM tournaments WHERE id = ?')
    .bind(tournamentId)
    .first<{ id: number }>()
  if (!tournament) return c.json({ error: 'Tournament not found' }, 404)

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
       INNER JOIN match_entries me ON me.player_id = p.id AND me.status = 'active'
       INNER JOIN matches m ON m.id = me.match_id AND m.tournament_id = ?
       GROUP BY p.id, p.name
       ORDER BY total_points DESC, wins DESC`
    )
    .bind(tournamentId)
    .all<{ player_id: number; player_name: string; total_points: number; wins: number; draws: number; losses: number; matches_played: number }>()

  const rows = statsResult.results
  if (rows.length === 0) return c.json([] as StandingsEntry[])

  const playerIds = rows.map(r => r.player_id)
  const placeholders = playerIds.map(() => '?').join(', ')
  const commandersResult = await db
    .prepare(
      `SELECT DISTINCT me.player_id, me.commander_name
       FROM match_entries me
       INNER JOIN matches m ON m.id = me.match_id AND m.tournament_id = ?
       WHERE me.player_id IN (${placeholders}) AND me.commander_name IS NOT NULL`
    )
    .bind(tournamentId, ...playerIds)
    .all<{ player_id: number; commander_name: string }>()

  const commandersMap = new Map<number, string[]>()
  for (const row of commandersResult.results) {
    const list = commandersMap.get(row.player_id) ?? []
    list.push(row.commander_name)
    commandersMap.set(row.player_id, list)
  }

  const standings: StandingsEntry[] = rows.map((row, i) => ({
    rank: i + 1,
    player_id: row.player_id,
    player_name: row.player_name,
    total_points: row.total_points,
    wins: row.wins,
    draws: row.draws,
    losses: row.losses,
    matches_played: row.matches_played,
    commanders: commandersMap.get(row.player_id) ?? [],
  }))

  return c.json(standings)
})

export default tournaments
