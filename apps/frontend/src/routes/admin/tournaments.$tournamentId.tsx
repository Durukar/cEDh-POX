import { createRoute, useParams, Link } from '@tanstack/react-router'
import { rootRoute } from '../__root'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTournament, fetchAdminMatches, deleteMatch } from '../../lib/api'
import { CreateMatchForm } from '../../components/admin/CreateMatchForm'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChevronLeft, Eye, Trash2 } from 'lucide-react'
import { useState } from 'react'

export const adminTournamentDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/tournaments/$tournamentId',
  component: AdminTournamentDetailPage,
})

function AdminTournamentDetailPage() {
  const { tournamentId } = useParams({ from: '/admin/tournaments/$tournamentId' })
  return <TournamentMatchManager tournamentId={Number(tournamentId)} />
}

function TournamentMatchManager({ tournamentId }: { tournamentId: number }) {
  const qc = useQueryClient()
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  const { data: tournament } = useQuery({
    queryKey: ['tournament', tournamentId],
    queryFn: () => fetchTournament(tournamentId),
  })

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['admin-matches', tournamentId],
    queryFn: () => fetchAdminMatches(tournamentId),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteMatch,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-matches', tournamentId] }); qc.invalidateQueries({ queryKey: ['admin-tournaments'] }); setConfirmDelete(null) },
    onError: () => {},
  })

  function handleDelete(id: number) {
    if (confirmDelete === id) { deleteMutation.mutate(id); setConfirmDelete(null) }
    else setConfirmDelete(id)
  }

  const isFinished = tournament?.status === 'finished'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/admin/tournaments"
          className="inline-flex items-center h-7 gap-1 rounded-md px-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Campeonatos
        </Link>
        <Separator orientation="vertical" className="h-5 bg-border/50" />
        <h1 className="text-xl font-semibold">{tournament?.name ?? '...'}</h1>
        {tournament && (
          <Badge
            variant={isFinished ? 'secondary' : 'default'}
            className={!isFinished ? 'border-emerald-800 text-emerald-400 bg-emerald-950/40' : ''}
          >
            {isFinished ? 'Encerrado' : 'Ativo'}
          </Badge>
        )}
      </div>

      {!isFinished && (
        <CreateMatchForm tournamentId={tournamentId} />
      )}
      {isFinished && (
        <p className="text-sm text-muted-foreground border border-border/50 rounded-lg px-4 py-3">
          Este campeonato está encerrado. Para adicionar rodadas, reabra-o na página de campeonatos.
        </p>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Rodadas</h2>
          <Badge variant="secondary">{matches.length}</Badge>
        </div>
        <Separator className="bg-border/50" />
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-medium w-20">Rodada</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-medium w-28">Data</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-medium">Notas</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-medium w-24 text-center">Jogadores</TableHead>
                <TableHead className="w-40" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground text-sm">Carregando...</TableCell></TableRow>
              ) : matches.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground text-sm">Nenhuma rodada ainda.</TableCell></TableRow>
              ) : (
                matches.map(m => (
                  <TableRow key={m.id} className="border-border/30 hover:bg-muted/20 transition-colors">
                    <TableCell className="py-3 font-medium">
                      <span className="text-muted-foreground text-xs mr-1">#</span>{m.match_number}
                    </TableCell>
                    <TableCell className="py-3 text-muted-foreground text-sm">
                      {new Date(m.played_at + 'T12:00:00').toLocaleDateString('pt-BR')}
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
                          className="inline-flex items-center h-7 gap-1 rounded-md px-2.5 text-xs font-medium transition-all hover:bg-muted hover:text-foreground text-muted-foreground"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Ver
                        </Link>
                        {confirmDelete === m.id ? (
                          <div className="flex items-center gap-1">
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(m.id)} disabled={deleteMutation.isPending}>Confirmar</Button>
                            <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
                          </div>
                        ) : (
                          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => handleDelete(m.id)}>
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
