import type { GlobalStandingsEntry, Match, MatchEntry, Player, PlayerProfile, StandingsEntry, Tournament } from '@cedh-pox/shared'

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8787'

function getAdminToken(): string {
  return localStorage.getItem('admin_token') ?? ''
}

// --- Public: Tournaments ---

export async function fetchTournaments(): Promise<Tournament[]> {
  const res = await fetch(`${BASE}/api/tournaments`)
  if (!res.ok) throw new Error('Failed to fetch tournaments')
  return res.json()
}

export async function fetchTournament(id: number): Promise<Tournament> {
  const res = await fetch(`${BASE}/api/tournaments/${id}`)
  if (!res.ok) throw new Error('Tournament not found')
  return res.json()
}

export async function fetchTournamentMatches(tournamentId: number): Promise<Match[]> {
  const res = await fetch(`${BASE}/api/tournaments/${tournamentId}/matches`)
  if (!res.ok) throw new Error('Failed to fetch matches')
  return res.json()
}

export async function fetchTournamentStandings(tournamentId: number): Promise<StandingsEntry[]> {
  const res = await fetch(`${BASE}/api/tournaments/${tournamentId}/standings`)
  if (!res.ok) throw new Error('Failed to fetch standings')
  return res.json()
}

// --- Public: Players ---

export async function fetchGlobalStandings(): Promise<GlobalStandingsEntry[]> {
  const res = await fetch(`${BASE}/api/players`)
  if (!res.ok) throw new Error('Failed to fetch standings')
  return res.json()
}

export async function fetchPlayerProfile(playerId: number): Promise<PlayerProfile> {
  const res = await fetch(`${BASE}/api/players/${playerId}`)
  if (!res.ok) throw new Error('Player not found')
  return res.json()
}

// --- Admin: Tournaments ---

export async function fetchAdminTournaments(): Promise<(Tournament & { match_count: number })[]> {
  const res = await fetch(`${BASE}/api/admin/tournaments`, {
    headers: { 'X-Admin-Token': getAdminToken() },
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error('Failed to fetch tournaments')
  return res.json()
}

export async function createTournament(data: { name: string; description?: string }): Promise<Tournament> {
  const res = await fetch(`${BASE}/api/admin/tournaments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Token': getAdminToken() },
    body: JSON.stringify(data),
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function updateTournament(id: number, data: { name?: string; description?: string; status?: 'active' | 'finished' }): Promise<Tournament> {
  const res = await fetch(`${BASE}/api/admin/tournaments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Token': getAdminToken() },
    body: JSON.stringify(data),
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function deleteTournament(id: number): Promise<void> {
  const res = await fetch(`${BASE}/api/admin/tournaments/${id}`, {
    method: 'DELETE',
    headers: { 'X-Admin-Token': getAdminToken() },
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error(await res.text())
}

// --- Admin: Matches ---

export async function fetchAdminMatches(tournamentId: number): Promise<Match[]> {
  return fetchTournamentMatches(tournamentId)
}

export async function fetchMatch(matchId: number): Promise<Match> {
  const res = await fetch(`${BASE}/api/admin/matches/${matchId}`, {
    headers: { 'X-Admin-Token': getAdminToken() },
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error('Match not found')
  return res.json()
}

export async function createMatch(data: { match_number: number; notes?: string; played_at: string; tournament_id: number }): Promise<Omit<Match, 'entries'>> {
  const res = await fetch(`${BASE}/api/admin/matches`, {
    method: 'POST',
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

// --- Admin: Match Entries ---

export async function createEntry(
  matchId: number,
  data: { player_id: number; commander_name?: string; status: 'active' | 'disband'; result: 'win' | 'draw' | 'loss' | 'none' }
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

export async function deleteEntry(matchId: number, entryId: number): Promise<void> {
  const res = await fetch(`${BASE}/api/admin/matches/${matchId}/entries/${entryId}`, {
    method: 'DELETE',
    headers: { 'X-Admin-Token': getAdminToken() },
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error(await res.text())
}

// --- Admin: Players ---

export async function fetchPlayers(): Promise<Player[]> {
  const res = await fetch(`${BASE}/api/admin/players`, {
    headers: { 'X-Admin-Token': getAdminToken() },
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error('Failed to fetch players')
  return res.json()
}

export async function createPlayer(name: string): Promise<Player> {
  const res = await fetch(`${BASE}/api/admin/players`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Token': getAdminToken() },
    body: JSON.stringify({ name }),
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function updatePlayer(id: number, name: string): Promise<Player> {
  const res = await fetch(`${BASE}/api/admin/players/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Token': getAdminToken() },
    body: JSON.stringify({ name }),
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function deletePlayer(id: number): Promise<void> {
  const res = await fetch(`${BASE}/api/admin/players/${id}`, {
    method: 'DELETE',
    headers: { 'X-Admin-Token': getAdminToken() },
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error(await res.text())
}
