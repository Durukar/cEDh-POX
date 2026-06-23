import type { LeaderboardEntry, Match, MatchEntry } from '@cedh-pox/shared'

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8787'

function getAdminToken(): string {
  return localStorage.getItem('admin_token') ?? ''
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch(`${BASE}/api/leaderboard`)
  if (!res.ok) throw new Error('Failed to fetch leaderboard')
  return res.json()
}

export async function fetchMatches(): Promise<Match[]> {
  const res = await fetch(`${BASE}/api/matches`)
  if (!res.ok) throw new Error('Failed to fetch matches')
  return res.json()
}

// Admin API functions — attach X-Admin-Token header
export async function createMatch(data: { match_number: number; notes?: string }): Promise<Match> {
  const res = await fetch(`${BASE}/api/admin/matches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Token': getAdminToken() },
    body: JSON.stringify(data),
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function createEntry(
  matchId: number,
  data: { player_name: string; commander_name?: string; status: 'active' | 'disband'; result: 'win' | 'draw' | 'loss' | 'none' }
): Promise<MatchEntry> {
  const res = await fetch(`${BASE}/api/admin/matches/${matchId}/entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Token': getAdminToken() },
    body: JSON.stringify(data),
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function updateEntry(
  matchId: number,
  entryId: number,
  data: Partial<{ commander_name: string; status: 'active' | 'disband'; result: 'win' | 'draw' | 'loss' | 'none' }>
): Promise<MatchEntry> {
  const res = await fetch(`${BASE}/api/admin/matches/${matchId}/entries/${entryId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Token': getAdminToken() },
    body: JSON.stringify(data),
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function deleteMatch(matchId: number): Promise<void> {
  const res = await fetch(`${BASE}/api/admin/matches/${matchId}`, {
    method: 'DELETE',
    headers: { 'X-Admin-Token': getAdminToken() },
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error(await res.text())
}
