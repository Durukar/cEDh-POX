import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createMatch } from '../../lib/api'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export function CreateMatchForm({ onUnauthorized }: { onUnauthorized: () => void }) {
  const qc = useQueryClient()
  const [matchNumber, setMatchNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: createMatch,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-matches'] })
      setMatchNumber(''); setNotes(''); setError('')
    },
    onError: (e) => {
      if ((e as Error).message === 'UNAUTHORIZED') { onUnauthorized(); return }
      setError((e as Error).message)
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const num = parseInt(matchNumber)
    if (isNaN(num) || num <= 0) { setError('Match number must be a positive integer'); return }
    mutation.mutate({ match_number: num, notes: notes || undefined })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
      <div className="space-y-1.5">
        <Label htmlFor="match-number">Partida #</Label>
        <Input
          id="match-number"
          type="number"
          value={matchNumber}
          onChange={e => setMatchNumber(e.target.value)}
          className="w-28"
          placeholder="1"
          min={1}
        />
      </div>
      <div className="space-y-1.5 flex-1 min-w-48">
        <Label htmlFor="notes">Notas <span className="text-muted-foreground">(opcional)</span></Label>
        <Input
          id="notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Observações da rodada..."
        />
      </div>
      <Button type="submit" disabled={mutation.isPending}>
        <Plus className="h-4 w-4 mr-1" />
        {mutation.isPending ? 'Criando...' : 'Criar Partida'}
      </Button>
      {error && <p className="text-destructive text-xs self-center">{error}</p>}
    </form>
  )
}
