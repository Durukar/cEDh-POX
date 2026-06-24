import { Hono } from 'hono'
import type { Env } from '../index'
import type { Match, MatchEntry } from '@cedh-pox/shared'

const matches = new Hono<{ Bindings: Env }>()

matches.get('/', async (c) => {
  const db = c.env.DB

  const result = await db
    .prepare(
      `SELECT
        m.id, m.match_number, m.notes, m.played_at, m.tournament_id,
        me.id AS entry_id, me.player_id, me.commander_name, me.status, me.result, me.points,
        p.name AS player_name
      FROM matches m
      LEFT JOIN match_entries me ON me.match_id = m.id
      LEFT JOIN players p ON p.id = me.player_id
      ORDER BY m.match_number ASC, me.id ASC`
    )
    .all<{
      id: number
      match_number: number
      notes: string | null
      played_at: string
      tournament_id: number
      entry_id: number | null
      player_id: number | null
      commander_name: string | null
      status: 'active' | 'disband' | null
      result: 'win' | 'draw' | 'loss' | 'none' | null
      points: number | null
      player_name: string | null
    }>()

  // Group flat rows by match
  const matchMap = new Map<number, Match>()
  for (const row of result.results) {
    if (!matchMap.has(row.id)) {
      matchMap.set(row.id, {
        id: row.id,
        match_number: row.match_number,
        notes: row.notes,
        played_at: row.played_at,
        tournament_id: row.tournament_id,
        entries: [],
      })
    }
    // Only add entry if there is one (LEFT JOIN may produce null entry_id)
    if (row.entry_id !== null) {
      const entry: MatchEntry = {
        id: row.entry_id,
        match_id: row.id,
        player_id: row.player_id!,
        player_name: row.player_name!,
        commander_name: row.commander_name,
        status: row.status!,
        result: row.result!,
        points: row.points!,
      }
      matchMap.get(row.id)!.entries.push(entry)
    }
  }

  return c.json(Array.from(matchMap.values()))
})

export default matches
