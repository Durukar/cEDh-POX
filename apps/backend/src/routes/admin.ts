import { Hono } from 'hono'
import type { Env } from '../index'
import { adminAuth } from '../middleware/auth'
import { calcPoints } from '../lib/points'

const admin = new Hono<{ Bindings: Env }>()

// Apply auth middleware to all admin routes
admin.use('*', adminAuth)

// POST /api/admin/matches — create a new match (requires tournament_id)
admin.post('/matches', async (c) => {
  const db = c.env.DB
  const body = await c.req.json<{ match_number: number; notes?: string; played_at?: string; tournament_id: number }>()

  if (typeof body.match_number !== 'number') {
    return c.json({ error: 'match_number is required and must be a number' }, 400)
  }
  if (typeof body.tournament_id !== 'number') {
    return c.json({ error: 'tournament_id is required and must be a number' }, 400)
  }

  const tournament = await db
    .prepare('SELECT id, status FROM tournaments WHERE id = ?')
    .bind(body.tournament_id)
    .first<{ id: number; status: string }>()
  if (!tournament) return c.json({ error: 'Tournament not found' }, 404)
  if (tournament.status === 'finished') return c.json({ error: 'Cannot add matches to a finished tournament' }, 409)

  const playedAt = body.played_at ?? new Date().toISOString().slice(0, 10)

  const existing = await db
    .prepare('SELECT id FROM matches WHERE match_number = ? AND tournament_id = ?')
    .bind(body.match_number, body.tournament_id)
    .first<{ id: number }>()
  if (existing) {
    return c.json({ error: `match_number ${body.match_number} already exists in this tournament` }, 409)
  }

  const insertResult = await db
    .prepare('INSERT INTO matches (match_number, notes, played_at, tournament_id) VALUES (?, ?, ?, ?) RETURNING id, match_number, notes, played_at, tournament_id')
    .bind(body.match_number, body.notes ?? null, playedAt, body.tournament_id)
    .first<{ id: number; match_number: number; notes: string | null; played_at: string; tournament_id: number }>()

  return c.json(insertResult, 201)
})

// GET /api/admin/matches/:id — get a single match with entries
admin.get('/matches/:id', async (c) => {
  const db = c.env.DB
  const matchId = Number(c.req.param('id'))

  const rows = await db
    .prepare(
      `SELECT m.id, m.match_number, m.notes, m.played_at, m.tournament_id,
              me.id AS entry_id, me.player_id, me.commander_name, me.status, me.result, me.points,
              p.name AS player_name
       FROM matches m
       LEFT JOIN match_entries me ON me.match_id = m.id
       LEFT JOIN players p ON p.id = me.player_id
       WHERE m.id = ?
       ORDER BY me.id ASC`
    )
    .bind(matchId)
    .all<{
      id: number; match_number: number; notes: string | null; played_at: string; tournament_id: number
      entry_id: number | null; player_id: number | null; commander_name: string | null
      status: 'active' | 'disband' | null; result: 'win' | 'draw' | 'loss' | 'none' | null
      points: number | null; player_name: string | null
    }>()

  if (rows.results.length === 0) return c.json({ error: 'Match not found' }, 404)

  const first = rows.results[0]
  const match = {
    id: first.id, match_number: first.match_number, notes: first.notes,
    played_at: first.played_at, tournament_id: first.tournament_id,
    entries: rows.results
      .filter(r => r.entry_id !== null)
      .map(r => ({
        id: r.entry_id!, match_id: first.id, player_id: r.player_id!,
        player_name: r.player_name!, commander_name: r.commander_name,
        status: r.status!, result: r.result!, points: r.points!,
      })),
  }
  return c.json(match)
})

// POST /api/admin/matches/:id/entries — add an entry to a match
admin.post('/matches/:id/entries', async (c) => {
  const db = c.env.DB
  const matchId = Number(c.req.param('id'))

  const body = await c.req.json<{
    player_id: number
    commander_name?: string
    status: 'active' | 'disband'
    result: 'win' | 'draw' | 'loss' | 'none'
  }>()

  if (typeof body.player_id !== 'number') {
    return c.json({ error: 'player_id is required and must be a number' }, 400)
  }

  // Verify match exists
  const match = await db
    .prepare('SELECT id FROM matches WHERE id = ?')
    .bind(matchId)
    .first<{ id: number }>()

  if (!match) {
    return c.json({ error: 'Match not found' }, 404)
  }

  // Lookup player by ID
  const player = await db
    .prepare('SELECT id, name FROM players WHERE id = ?')
    .bind(body.player_id)
    .first<{ id: number; name: string }>()

  if (!player) {
    return c.json({ error: 'Player not found' }, 404)
  }

  const points = calcPoints(body.result ?? 'none', body.status)

  const entry = await db
    .prepare(
      `INSERT INTO match_entries (match_id, player_id, commander_name, status, result, points)
       VALUES (?, ?, ?, ?, ?, ?)
       RETURNING id, match_id, player_id, commander_name, status, result, points`
    )
    .bind(matchId, player.id, body.commander_name ?? null, body.status, body.result ?? 'none', points)
    .first<{
      id: number
      match_id: number
      player_id: number
      commander_name: string | null
      status: string
      result: string
      points: number
    }>()

  return c.json({ ...entry, player_name: player.name }, 201)
})

// PUT /api/admin/matches/:id/entries/:entryId — update an entry
admin.put('/matches/:id/entries/:entryId', async (c) => {
  const db = c.env.DB
  const matchId = Number(c.req.param('id'))
  const entryId = Number(c.req.param('entryId'))

  const body = await c.req.json<{
    commander_name?: string
    status?: 'active' | 'disband'
    result?: 'win' | 'draw' | 'loss' | 'none'
  }>()

  // Fetch existing entry
  const existing = await db
    .prepare('SELECT * FROM match_entries WHERE id = ? AND match_id = ?')
    .bind(entryId, matchId)
    .first<{
      id: number
      match_id: number
      player_id: number
      commander_name: string | null
      status: string
      result: string
      points: number
    }>()

  if (!existing) {
    return c.json({ error: 'Entry not found' }, 404)
  }

  // Merge changes
  const newStatus = body.status ?? existing.status
  const newResult = body.result ?? existing.result
  const newCommander = 'commander_name' in body ? (body.commander_name ?? null) : existing.commander_name
  const newPoints = calcPoints(newResult, newStatus)

  const result = await db
    .prepare(
      `UPDATE match_entries
       SET commander_name = ?, status = ?, result = ?, points = ?
       WHERE id = ?
       RETURNING id, match_id, player_id, commander_name, status, result, points`
    )
    .bind(newCommander, newStatus, newResult, newPoints, entryId)
    .all<{
      id: number
      match_id: number
      player_id: number
      commander_name: string | null
      status: string
      result: string
      points: number
    }>()

  const updated = result.results[0]
  if (!updated) return c.json({ error: 'Entry not found' }, 404)

  // Fetch player name for response
  const player = await db
    .prepare('SELECT name FROM players WHERE id = ?')
    .bind(updated.player_id)
    .first<{ name: string }>()

  return c.json({ ...updated, player_name: player?.name ?? null })
})

// DELETE /api/admin/matches/:id/entries/:entryId — remove a player from a match
admin.delete('/matches/:id/entries/:entryId', async (c) => {
  const db = c.env.DB
  const matchId = Number(c.req.param('id'))
  const entryId = Number(c.req.param('entryId'))

  const entry = await db
    .prepare('SELECT id FROM match_entries WHERE id = ? AND match_id = ?')
    .bind(entryId, matchId)
    .first<{ id: number }>()

  if (!entry) {
    return c.json({ error: 'Entry not found' }, 404)
  }

  await db.prepare('DELETE FROM match_entries WHERE id = ?').bind(entryId).run()

  return c.json({ success: true })
})

// DELETE /api/admin/matches/:id — delete a match (cascades to entries)
admin.delete('/matches/:id', async (c) => {
  const db = c.env.DB
  const matchId = Number(c.req.param('id'))

  const match = await db
    .prepare('SELECT id FROM matches WHERE id = ?')
    .bind(matchId)
    .first<{ id: number }>()

  if (!match) {
    return c.json({ error: 'Match not found' }, 404)
  }

  await db.prepare('DELETE FROM matches WHERE id = ?').bind(matchId).run()

  return c.json({ success: true })
})

export default admin
