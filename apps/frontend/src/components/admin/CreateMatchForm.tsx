import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createMatch } from '../../lib/api'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, CalendarDays } from 'lucide-react'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

interface Props {
  tournamentId: number
}

export function CreateMatchForm({ tournamentId }: Props) {
  const qc = useQueryClient()
  const [matchNumber, setMatchNumber] = useState('')
  const [playedAt, setPlayedAt] = useState(todayISO)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: createMatch,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-matches', tournamentId] })
      qc.invalidateQueries({ queryKey: ['admin-tournaments'] })
      setMatchNumber(''); setNotes(''); setPlayedAt(todayISO()); setError('')
    },
    onError: (e) => { setError((e as Error).message) },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const num = parseInt(matchNumber)
    if (isNaN(num) || num <= 0) { setError('Número da rodada inválido'); return }
    if (!playedAt) { setError('Informe a data'); return }
    mutation.mutate({ match_number: num, notes: notes || undefined, played_at: playedAt, tournament_id: tournamentId })
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          Nova Rodada
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1.5">
            <Label htmlFor="match-number">Rodada #</Label>
            <Input id="match-number" type="number" value={matchNumber} onChange={e => setMatchNumber(e.target.value)} className="w-24" placeholder="1" min={1} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="played-at">Data</Label>
            <Input id="played-at" type="date" value={playedAt} onChange={e => setPlayedAt(e.target.value)} className="w-36" />
          </div>
          <div className="space-y-1.5 flex-1 min-w-40">
            <Label htmlFor="notes">Notas <span className="text-muted-foreground">(opcional)</span></Label>
            <Input id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Observações..." />
          </div>
          <Button type="submit" disabled={mutation.isPending}>
            <Plus className="h-4 w-4 mr-1" />
            {mutation.isPending ? 'Criando...' : 'Criar Rodada'}
          </Button>
          {error && <p className="text-destructive text-xs self-center">{error}</p>}
        </form>
      </CardContent>
    </Card>
  )
}
