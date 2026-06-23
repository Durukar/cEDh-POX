import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchMatches, deleteMatch } from '../../lib/api'
import { CreateMatchForm } from './CreateMatchForm'
import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Eye, Trash2 } from 'lucide-react'

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

  function handleDelete(id: number) {
    if (confirmDelete === id) {
      deleteMutation.mutate(id)
      setConfirmDelete(null)
    } else {
      setConfirmDelete(id)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Gerencie as partidas do campeonato</p>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Nova Partida</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateMatchForm onUnauthorized={onUnauthorized} />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Partidas</h2>
          <Badge variant="secondary">{matches.length}</Badge>
        </div>
        <Separator className="bg-border/50" />
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-medium w-24">Partida</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-medium">Notas</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-medium w-24 text-center">Jogadores</TableHead>
                <TableHead className="w-40" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground text-sm">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : matches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground text-sm">
                    Nenhuma partida ainda.
                  </TableCell>
                </TableRow>
              ) : (
                matches.map(m => (
                  <TableRow key={m.id} className="border-border/30 hover:bg-muted/20 transition-colors">
                    <TableCell className="py-3 font-medium">
                      <span className="text-muted-foreground text-xs mr-1">#</span>{m.match_number}
                    </TableCell>
                    <TableCell className="py-3 text-muted-foreground text-sm">{m.notes ?? '—'}</TableCell>
                    <TableCell className="py-3 text-center">
                      <Badge variant="secondary" className="text-xs">{m.entries.length}</Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to="/admin/matches/$matchId"
                          params={{ matchId: String(m.id) }}
                          className="inline-flex items-center h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] font-medium transition-all hover:bg-muted hover:text-foreground"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" />
                          Ver
                        </Link>
                        {confirmDelete === m.id ? (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(m.id)}
                              disabled={deleteMutation.isPending}
                            >
                              Confirmar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setConfirmDelete(null)}
                            >
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => setConfirmDelete(m.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
