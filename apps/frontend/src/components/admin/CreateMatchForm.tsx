import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createMatch } from '../../lib/api'

export function CreateMatchForm({ onUnauthorized }: { onUnauthorized: () => void }) {
  const qc = useQueryClient()
  const [matchNumber, setMatchNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: createMatch,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-matches'] })
      setMatchNumber('')
      setNotes('')
      setError('')
    },
    onError: (e) => {
      if ((e as Error).message === 'UNAUTHORIZED') { onUnauthorized(); return }
      setError((e as Error).message)
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const num = parseInt(matchNumber)
    if (!num || isNaN(num)) { setError('Match number must be a valid integer'); return }
    mutation.mutate({ match_number: num, notes: notes || undefined })
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-end">
      <div>
        <label className="block text-xs text-zinc-500 mb-1">Match #</label>
        <input
          type="number"
          value={matchNumber}
          onChange={e => setMatchNumber(e.target.value)}
          className="w-24 bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-zinc-500"
          placeholder="1"
        />
      </div>
      <div className="flex-1">
        <label className="block text-xs text-zinc-500 mb-1">Notes (optional)</label>
        <input
          type="text"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-zinc-500"
          placeholder="Round notes..."
        />
      </div>
      <button
        type="submit"
        disabled={mutation.isPending}
        className="bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white rounded px-4 py-1.5 text-sm font-medium transition-colors"
      >
        {mutation.isPending ? 'Creating...' : 'Create Match'}
      </button>
      {error && <p className="text-red-400 text-xs self-center">{error}</p>}
    </form>
  )
}
