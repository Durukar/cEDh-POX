import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createEntry } from '../../lib/api'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserPlus } from 'lucide-react'

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!playerName.trim()) { setError('Nome do jogador obrigatório'); return }
    mutation.mutate()
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-muted-foreground" />
          Adicionar Jogador
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="player-name">Jogador</Label>
              <Input
                id="player-name"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                placeholder="Nome do jogador"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="commander">Comandante <span className="text-muted-foreground">(opcional)</span></Label>
              <Input
                id="commander"
                value={commander}
                onChange={e => setCommander(e.target.value)}
                placeholder="ex: Thrasios & Tymna"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={v => setStatus(v as 'active' | 'disband')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="disband">Desistiu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Resultado</Label>
              <Select value={result} onValueChange={v => setResult(v as 'win' | 'draw' | 'loss' | 'none')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  <SelectItem value="win">Vitória</SelectItem>
                  <SelectItem value="draw">Empate</SelectItem>
                  <SelectItem value="loss">Derrota</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {error && <p className="text-destructive text-xs">{error}</p>}
          <Button type="submit" disabled={mutation.isPending} size="sm">
            {mutation.isPending ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
