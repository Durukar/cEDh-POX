import { Hono } from 'hono'
import type { Env } from '../index'
import { adminAuth } from '../middleware/auth'
import { calcPoints } from '../lib/points'

const admin = new Hono<{ Bindings: Env }>()

// Apply auth middleware to all admin routes
admin.use('*', adminAuth)

// POST /api/admin/matches — create a new match
admin.post('/matches', async (c) => {
  const db = c.env.DB
  const body = await c.req.json<{ match_number: number; notes?: string }>()

  if (typeof body.match_number !== 'number') {
    return c.json({ error: 'match_number is required and must be a number' }, 400)
  }

  // Check uniqueness
  const existing = await db
    .prepare('SELECT id FROM matches WHERE match_number = ?')
    .bind(body.match_number)
    .first<{ id: number }>()

  if (existing) {
    return c.json({ error: `match_number ${body.match_number} already exists` }, 409)
  }

  const insertResult = await db
    .prepare('INSERT INTO matches (match_number, notes) VALUES (?, ?) RETURNING id, match_number, notes, played_at')
    .bind(body.match_number, body.notes ?? null)
    .first<{ id: number; match_number: number; notes: string | null; played_at: string }>()

  return c.json(insertResult, 201)
})

// POST /api/admin/matches/:id/entries — add an entry to a match
admin.post('/matches/:id/entries', async (c) => {
  const db = c.env.DB
  const matchId = Number(c.req.param('id'))

  const body = await c.req.json<{
    player_name: string
    commander_name?: string
    status: 'active' | 'disband'
    result: 'win' | 'draw' | 'loss' | 'none'
  }>()

  if (!body.player_name) {
    return c.json({ error: 'player_name is required' }, 400)
  }

  // Verify match exists
  const match = await db
    .prepare('SELECT id FROM matches WHERE id = ?')
    .bind(matchId)
    .first<{ id: number }>()

  if (!match) {
    return c.json({ error: 'Match not found' }, 404)
  }

  // Upsert player by name
  await db
    .prepare('INSERT OR IGNORE INTO players (name) VALUES (?)')
    .bind(body.player_name)
    .run()

  const player = await db
    .prepare('SELECT id FROM players WHERE name = ?')
    .bind(body.player_name)
    .first<{ id: number }>()

  if (!player) {
    return c.json({ error: 'Failed to upsert player' }, 500)
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

  return c.json({ ...entry, player_name: body.player_name }, 201)
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

  const updated = await db
    .prepare(
      `UPDATE match_entries
       SET commander_name = ?, status = ?, result = ?, points = ?
       WHERE id = ?
       RETURNING id, match_id, player_id, commander_name, status, result, points`
    )
    .bind(newCommander, newStatus, newResult, newPoints, entryId)
    .first<{
      id: number
      match_id: number
      player_id: number
      commander_name: string | null
      status: string
      result: string
      points: number
    }>()

  // Fetch player name for response
  const player = await db
    .prepare('SELECT name FROM players WHERE id = ?')
    .bind(updated!.player_id)
    .first<{ name: string }>()

  return c.json({ ...updated, player_name: player?.name ?? null })
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
