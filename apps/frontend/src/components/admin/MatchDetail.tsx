import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchMatches } from '../../lib/api'
import type { MatchEntry } from '@cedh-pox/shared'
import { AddEntryForm } from './AddEntryForm'
import { EditEntryModal } from './EditEntryModal'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { ChevronLeft, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  matchId: number
  onUnauthorized: () => void
}

const resultLabel: Record<string, string> = {
  win: 'Vitória',
  draw: 'Empate',
  loss: 'Derrota',
  none: '—',
}

const resultVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  win: 'default',
  draw: 'secondary',
  loss: 'destructive',
  none: 'outline',
}

export function MatchDetail({ matchId, onUnauthorized }: Props) {
  const { data: matches = [] } = useQuery({
    queryKey: ['admin-matches'],
    queryFn: fetchMatches,
  })
  const match = matches.find(m => m.id === matchId)
  const [editEntry, setEditEntry] = useState<MatchEntry | null>(null)

  if (!match) return (
    <p className="text-muted-foreground text-sm">Partida não encontrada.</p>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/admin"
          className="inline-flex items-center h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar
        </Link>
        <Separator orientation="vertical" className="h-5 bg-border/50" />
        <h1 className="text-xl font-semibold">Partida #{match.match_number}</h1>
        {match.notes && (
          <span className="text-muted-foreground text-sm">{match.notes}</span>
        )}
      </div>

      {/* Add player form */}
      <AddEntryForm matchId={matchId} onUnauthorized={onUnauthorized} />

      {/* Entries table */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold">Jogadores</h2>
          <Badge variant="secondary">{match.entries.length}</Badge>
        </div>
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-medium">Jogador</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-medium">Comandante</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-medium w-24 text-center">Status</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-medium w-28 text-center">Resultado</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-medium w-16 text-right">Pts</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {match.entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-20 text-center text-muted-foreground text-sm">
                    Nenhum jogador adicionado ainda.
                  </TableCell>
                </TableRow>
              ) : (
                match.entries.map(entry => (
                  <TableRow key={entry.id} className="border-border/30 hover:bg-muted/20 transition-colors">
                    <TableCell className="py-3 font-medium">{entry.player_name}</TableCell>
                    <TableCell className="py-3 text-muted-foreground text-sm">{entry.commander_name ?? '—'}</TableCell>
                    <TableCell className="py-3 text-center">
                      <Badge
                        variant={entry.status === 'disband' ? 'outline' : 'secondary'}
                        className={cn(
                          'text-xs',
                          entry.status === 'active' && 'border-emerald-800 text-emerald-400 bg-emerald-950/40',
                        )}
                      >
                        {entry.status === 'active' ? 'Ativo' : 'Desistiu'}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <Badge variant={resultVariant[entry.result] ?? 'outline'} className="text-xs">
                        {resultLabel[entry.result] ?? entry.result}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 text-right font-bold tabular-nums">{entry.points}</TableCell>
                    <TableCell className="py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => setEditEntry(entry)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {editEntry && (
        <EditEntryModal
          entry={editEntry}
          matchId={matchId}
          onClose={() => setEditEntry(null)}
          onUnauthorized={onUnauthorized}
        />
      )}
    </div>
  )
}
