import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateEntry } from '../../lib/api'
import type { MatchEntry } from '@cedh-pox/shared'

interface Props {
  entry: MatchEntry
  matchId: number
  onClose: () => void
}

export function EditEntryModal({ entry, matchId, onClose }: Props) {
  const qc = useQueryClient()
  const [commander, setCommander] = useState(entry.commander_name ?? '')
  const [status, setStatus] = useState(entry.status)
  const [result, setResult] = useState(entry.result)
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: () => updateEntry(matchId, entry.id, { commander_name: commander || undefined, status, result }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-matches'] }); onClose() },
    onError: (e) => setError((e as Error).message),
  })

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-sm space-y-4">
        <h3 className="font-semibold">Edit: {entry.player_name}</h3>
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Commander</label>
          <input value={commander} onChange={e => setCommander(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-zinc-500" />
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value as 'active' | 'disband')}
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm focus:outline-none">
            <option value="active">Active</option>
            <option value="disband">Disband</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Result</label>
          <select value={result} onChange={e => setResult(e.target.value as 'win' | 'draw' | 'loss' | 'none')}
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm focus:outline-none">
            <option value="none">—</option>
            <option value="win">Win</option>
            <option value="draw">Draw</option>
            <option value="loss">Loss</option>
          </select>
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="text-sm text-zinc-500 hover:text-zinc-300 px-3 py-1.5">Cancel</button>
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending}
            className="bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white rounded px-4 py-1.5 text-sm font-medium transition-colors">
            {mutation.isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
