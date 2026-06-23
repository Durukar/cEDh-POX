import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchMatches } from '../../lib/api'
import type { MatchEntry } from '@cedh-pox/shared'
import { AddEntryForm } from './AddEntryForm'
import { EditEntryModal } from './EditEntryModal'
import { Link } from '@tanstack/react-router'

interface Props {
  matchId: number
}

export function MatchDetail({ matchId }: Props) {
  const { data: matches = [] } = useQuery({
    queryKey: ['admin-matches'],
    queryFn: fetchMatches,
  })
  const match = matches.find(m => m.id === matchId)
  const [editEntry, setEditEntry] = useState<MatchEntry | null>(null)

  if (!match) return <p className="text-zinc-500 text-sm">Match not found.</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin" className="text-zinc-500 hover:text-zinc-300 text-sm">← Back</Link>
        <h1 className="text-xl font-bold">Match #{match.match_number}</h1>
        {match.notes && <span className="text-zinc-500 text-sm">{match.notes}</span>}
      </div>

      <AddEntryForm matchId={matchId} />

      <div>
        <h2 className="text-base font-semibold mb-3">Players ({match.entries.length})</h2>
        {match.entries.length === 0 ? (
          <p className="text-zinc-500 text-sm">No players added yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-zinc-500 border-b border-zinc-800">
                <th className="text-left py-2">Player</th>
                <th className="text-left py-2">Commander</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Result</th>
                <th className="text-left py-2">Pts</th>
                <th className="text-left py-2"></th>
              </tr>
            </thead>
            <tbody>
              {match.entries.map(entry => (
                <tr key={entry.id} className="border-t border-zinc-800 hover:bg-zinc-900">
                  <td className="py-2">{entry.player_name}</td>
                  <td className="py-2 text-zinc-400">{entry.commander_name ?? '—'}</td>
                  <td className="py-2">
                    <span className={entry.status === 'disband' ? 'text-zinc-500' : 'text-green-400'}>{entry.status}</span>
                  </td>
                  <td className="py-2 text-zinc-400">{entry.result}</td>
                  <td className="py-2 font-bold">{entry.points}</td>
                  <td className="py-2">
                    <button onClick={() => setEditEntry(entry)} className="text-xs text-zinc-500 hover:text-white">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editEntry && (
        <EditEntryModal
          entry={editEntry}
          matchId={matchId}
          onClose={() => setEditEntry(null)}
        />
      )}
    </div>
  )
}
