import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchMatches, deleteMatch } from '../../lib/api'
import { CreateMatchForm } from './CreateMatchForm'
import { Link } from '@tanstack/react-router'

interface Props {
  onUnauthorized: () => void
}

export function AdminDashboard({ onUnauthorized }: Props) {
  const qc = useQueryClient()
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['admin-matches'],
    queryFn: fetchMatches,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteMatch,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-matches'] }),
    onError: (e) => { if ((e as Error).message === 'UNAUTHORIZED') onUnauthorized() },
  })

  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  // confirmation dialog
  function handleDelete(id: number) {
    if (confirmDelete === id) {
      deleteMutation.mutate(id)
      setConfirmDelete(null)
    } else {
      setConfirmDelete(id)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        <CreateMatchForm onUnauthorized={onUnauthorized} />
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-4">Matches</h2>
        {isLoading ? (
          <p className="text-zinc-500 text-sm">Loading...</p>
        ) : matches.length === 0 ? (
          <p className="text-zinc-500 text-sm">No matches yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-zinc-500 border-b border-zinc-800">
                <th className="text-left py-2">Match #</th>
                <th className="text-left py-2">Notes</th>
                <th className="text-left py-2">Players</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {matches.map(m => (
                <tr key={m.id} className="border-t border-zinc-800 hover:bg-zinc-900">
                  <td className="py-2 font-medium">#{m.match_number}</td>
                  <td className="py-2 text-zinc-400">{m.notes ?? '—'}</td>
                  <td className="py-2 text-zinc-400">{m.entries.length}</td>
                  <td className="py-2 space-x-2">
                    <Link
                      to="/admin/matches/$matchId"
                      params={{ matchId: String(m.id) }}
                      className="text-zinc-400 hover:text-white text-xs underline"
                    >
                      View Entries
                    </Link>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className={`text-xs ${confirmDelete === m.id ? 'text-red-400 font-semibold' : 'text-zinc-500 hover:text-red-400'}`}
                    >
                      {confirmDelete === m.id ? 'Confirm Delete' : 'Delete'}
                    </button>
                    {confirmDelete === m.id && (
                      <button onClick={() => setConfirmDelete(null)} className="text-xs text-zinc-500 hover:text-zinc-300">
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
