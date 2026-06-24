import { Hono } from 'hono'
import type { Env } from '../index'
import { adminAuth } from '../middleware/auth'
import type { Tournament } from '@cedh-pox/shared'

const adminTournaments = new Hono<{ Bindings: Env }>()

adminTournaments.use('*', adminAuth)

// GET / — list all tournaments with match count
adminTournaments.get('/', async (c) => {
  const db = c.env.DB
  const rows = await db
    .prepare(
      `SELECT t.id, t.name, t.description, t.status, t.created_at,
              COUNT(m.id) AS match_count
       FROM tournaments t
       LEFT JOIN matches m ON m.tournament_id = t.id
       GROUP BY t.id
       ORDER BY t.created_at DESC`
    )
    .all<Tournament & { match_count: number }>()
  return c.json(rows.results)
})

// POST / — create tournament
adminTournaments.post('/', async (c) => {
  const db = c.env.DB
  const body = await c.req.json<{ name: string; description?: string }>()

  if (!body.name?.trim()) {
    return c.json({ error: 'name is required' }, 400)
  }

  const existing = await db
    .prepare('SELECT id FROM tournaments WHERE name = ?')
    .bind(body.name.trim())
    .first<{ id: number }>()
  if (existing) return c.json({ error: 'Tournament name already exists' }, 409)

  const row = await db
    .prepare('INSERT INTO tournaments (name, description) VALUES (?, ?) RETURNING id, name, description, status, created_at')
    .bind(body.name.trim(), body.description ?? null)
    .first<Tournament>()
  return c.json(row, 201)
})

// PUT /:id — rename or change status
adminTournaments.put('/:id', async (c) => {
  const db = c.env.DB
  const id = Number(c.req.param('id'))
  const body = await c.req.json<{ name?: string; description?: string; status?: 'active' | 'finished' }>()

  const existing = await db
    .prepare('SELECT id, name, description, status FROM tournaments WHERE id = ?')
    .bind(id)
    .first<{ id: number; name: string; description: string | null; status: string }>()
  if (!existing) return c.json({ error: 'Tournament not found' }, 404)

  const newName = body.name?.trim() ?? existing.name
  const newDescription = 'description' in body ? (body.description ?? null) : existing.description
  const newStatus = body.status ?? existing.status

  if (newName !== existing.name) {
    const duplicate = await db
      .prepare('SELECT id FROM tournaments WHERE name = ? AND id != ?')
      .bind(newName, id)
      .first<{ id: number }>()
    if (duplicate) return c.json({ error: 'Tournament name already exists' }, 409)
  }

  const row = await db
    .prepare('UPDATE tournaments SET name = ?, description = ?, status = ? WHERE id = ? RETURNING id, name, description, status, created_at')
    .bind(newName, newDescription, newStatus, id)
    .first<Tournament>()
  return c.json(row)
})

// DELETE /:id — only if no matches
adminTournaments.delete('/:id', async (c) => {
  const db = c.env.DB
  const id = Number(c.req.param('id'))

  const tournament = await db
    .prepare('SELECT id FROM tournaments WHERE id = ?')
    .bind(id)
    .first<{ id: number }>()
  if (!tournament) return c.json({ error: 'Tournament not found' }, 404)

  const { count } = await db
    .prepare('SELECT COUNT(*) AS count FROM matches WHERE tournament_id = ?')
    .bind(id)
    .first<{ count: number }>() ?? { count: 0 }
  if (count > 0) return c.json({ error: `Cannot delete: tournament has ${count} match(es)` }, 409)

  await db.prepare('DELETE FROM tournaments WHERE id = ?').bind(id).run()
  return c.json({ success: true })
})

export default adminTournaments
