import { Hono } from 'hono'
import type { Env } from '../index'
import { adminAuth } from '../middleware/auth'

const players = new Hono<{ Bindings: Env }>()

players.use('*', adminAuth)

// GET /api/admin/players
players.get('/', async (c) => {
  const db = c.env.DB
  const result = await db
    .prepare('SELECT id, name, created_at FROM players ORDER BY name ASC')
    .all<{ id: number; name: string; created_at: string }>()
  return c.json(result.results)
})

// POST /api/admin/players
players.post('/', async (c) => {
  const db = c.env.DB
  const body = await c.req.json<{ name: string }>()

  if (!body.name?.trim()) {
    return c.json({ error: 'name is required' }, 400)
  }

  const name = body.name.trim()

  const existing = await db
    .prepare('SELECT id FROM players WHERE name = ?')
    .bind(name)
    .first<{ id: number }>()
  if (existing) {
    return c.json({ error: `Jogador "${name}" já existe` }, 409)
  }

  const player = await db
    .prepare('INSERT INTO players (name) VALUES (?) RETURNING id, name, created_at')
    .bind(name)
    .first<{ id: number; name: string; created_at: string }>()

  return c.json(player, 201)
})

// PUT /api/admin/players/:id
players.put('/:id', async (c) => {
  const db = c.env.DB
  const playerId = Number(c.req.param('id'))
  const body = await c.req.json<{ name: string }>()

  if (!body.name?.trim()) {
    return c.json({ error: 'name is required' }, 400)
  }

  const name = body.name.trim()

  const existing = await db
    .prepare('SELECT id FROM players WHERE id = ?')
    .bind(playerId)
    .first<{ id: number }>()
  if (!existing) {
    return c.json({ error: 'Player not found' }, 404)
  }

  const duplicate = await db
    .prepare('SELECT id FROM players WHERE name = ? AND id != ?')
    .bind(name, playerId)
    .first<{ id: number }>()
  if (duplicate) {
    return c.json({ error: `Jogador "${name}" já existe` }, 409)
  }

  const player = await db
    .prepare('UPDATE players SET name = ? WHERE id = ? RETURNING id, name, created_at')
    .bind(name, playerId)
    .first<{ id: number; name: string; created_at: string }>()

  return c.json(player)
})

// DELETE /api/admin/players/:id
players.delete('/:id', async (c) => {
  const db = c.env.DB
  const playerId = Number(c.req.param('id'))

  const player = await db
    .prepare('SELECT id FROM players WHERE id = ?')
    .bind(playerId)
    .first<{ id: number }>()
  if (!player) {
    return c.json({ error: 'Player not found' }, 404)
  }

  const entryCount = await db
    .prepare('SELECT COUNT(*) as count FROM match_entries WHERE player_id = ?')
    .bind(playerId)
    .first<{ count: number }>()

  if (entryCount && entryCount.count > 0) {
    return c.json(
      { error: `Não é possível remover: jogador tem ${entryCount.count} entrada(s) em partidas` },
      409
    )
  }

  await db.prepare('DELETE FROM players WHERE id = ?').bind(playerId).run()

  return c.json({ success: true })
})

export default players
