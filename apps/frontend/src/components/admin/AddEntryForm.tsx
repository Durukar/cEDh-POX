import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createEntry } from '../../lib/api'

interface AddEntryFormProps {
  matchId: number
  onUnauthorized: () => void
}

export function AddEntryForm({ matchId, onUnauthorized }: AddEntryFormProps) {
  const qc = useQueryClient()
  const [playerName, setPlayerName] = useState('')
  const [commander, setCommander] = useState('')
  const [status, setStatus] = useState<'active' | 'disband'>('active')
  const [result, setResult] = useState<'win' | 'draw' | 'loss' | 'none'>('none')
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: () => createEntry(matchId, {
      player_name: playerName,
      commander_name: commander || undefined,
      status,
      result,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-matches'] })
      setPlayerName(''); setCommander(''); setStatus('active'); setResult('none'); setError('')
    },
    onError: (e) => {
      if ((e as Error).message === 'UNAUTHORIZED') { onUnauthorized(); return }
      setError((e as Error).message)
    },
  })

  return (
    <form onSubmit={e => { e.preventDefault(); if (!playerName.trim()) { setError('Player name required'); return } mutation.mutate() }}
      className="space-y-3 p-4 bg-zinc-900 rounded border border-zinc-800">
      <h3 className="text-sm font-semibold text-zinc-300">Add Player</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Player Name</label>
          <input value={playerName} onChange={e => setPlayerName(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-zinc-500" />
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Commander (optional)</label>
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
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <button type="submit" disabled={mutation.isPending}
        className="bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white rounded px-4 py-1.5 text-sm font-medium transition-colors">
        {mutation.isPending ? 'Adding...' : 'Add Player'}
      </button>
    </form>
  )
}
