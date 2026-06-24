import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateEntry } from '../../lib/api'
import type { MatchEntry } from '@cedh-pox/shared'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-match', matchId] }); onClose() },
    onError: (e) => { setError((e as Error).message) },
  })

  return (
    <Dialog open onOpenChange={open => { if (!open) onClose() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Editar: {entry.player_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-commander">Comandante</Label>
            <Input
              id="edit-commander"
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
          {error && <p className="text-destructive text-xs">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
