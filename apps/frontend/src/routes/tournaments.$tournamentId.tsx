import { createRoute, useParams, Link } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { useQuery } from '@tanstack/react-query'
import { fetchTournament, fetchTournamentStandings, fetchTournamentMatches } from '../lib/api'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChevronLeft } from 'lucide-react'

export const tournamentDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/campeonatos/$tournamentId',
  component: TournamentDetailPage,
})

function TournamentDetailPage() {
  const { tournamentId } = useParams({ from: '/campeonatos/$tournamentId' })
  const id = Number(tournamentId)

  const { data: tournament, isLoading: loadingT } = useQuery({
    queryKey: ['tournament', id],
    queryFn: () => fetchTournament(id),
  })
  const { data: standings = [], isLoading: loadingS } = useQuery({
    queryKey: ['tournament-standings', id],
    queryFn: () => fetchTournamentStandings(id),
  })
  const { data: matches = [], isLoading: loadingM } = useQuery({
    queryKey: ['tournament-matches', id],
    queryFn: () => fetchTournamentMatches(id),
  })

  if (loadingT) return <div className="text-muted-foreground text-sm py-8">Carregando...</div>
  if (!tournament) return <div className="text-muted-foreground text-sm py-8">Campeonato não encontrado.</div>

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <Link
          to="/campeonatos"
          className="inline-flex items-center h-7 gap-1 rounded-md px-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Campeonatos
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{tournament.name}</h1>
          <Badge
            variant={tournament.status === 'active' ? 'default' : 'secondary'}
            className={tournament.status === 'active' ? 'border-emerald-800 text-emerald-400 bg-emerald-950/40' : ''}
          >
            {tournament.status === 'active' ? 'Ativo' : 'Encerrado'}
          </Badge>
        </div>
        {tournament.description && (
          <p className="text-muted-foreground text-sm">{tournament.description}</p>
        )}
      </div>

      {/* Standings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Classificação</h2>
          <Badge variant="secondary">{standings.length} jogadores</Badge>
        </div>
        <Separator className="bg-border/50" />
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-medium w-12">#</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-medium">Jogador</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-medium w-16 text-right">Pts</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-medium w-12 text-center">V</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-medium w-12 text-center">E</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-medium w-12 text-center">D</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-medium w-20 text-center">Rodadas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingS ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-20 text-center text-muted-foreground text-sm">Carregando...</TableCell>
                </TableRow>
              ) : standings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-20 text-center text-muted-foreground text-sm">Nenhum jogador neste campeonato ainda.</TableCell>
                </TableRow>
              ) : (
                standings.map(s => (
                  <TableRow key={s.player_id} className="border-border/30 hover:bg-muted/20 transition-colors">
                    <TableCell className="py-3 text-muted-foreground tabular-nums">{s.rank}</TableCell>
                    <TableCell className="py-3">
                      <Link
                        to="/jogadores/$playerId"
                        params={{ playerId: String(s.player_id) }}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {s.player_name}
                      </Link>
                      {s.commanders.length > 0 && (
                        <p className="text-xs text-muted-foreground truncate max-w-xs">{s.commanders.join(' · ')}</p>
                      )}
                    </TableCell>
                    <TableCell className="py-3 text-right font-bold tabular-nums">{s.total_points}</TableCell>
                    <TableCell className="py-3 text-center tabular-nums text-muted-foreground">{s.wins}</TableCell>
                    <TableCell className="py-3 text-center tabular-nums text-muted-foreground">{s.draws}</TableCell>
                    <TableCell className="py-3 text-center tabular-nums text-muted-foreground">{s.losses}</TableCell>
                    <TableCell className="py-3 text-center tabular-nums text-muted-foreground">{s.matches_played}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Rounds */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Rodadas</h2>
          <Badge variant="secondary">{matches.length}</Badge>
        </div>
        <Separator className="bg-border/50" />
        {loadingM ? (
          <div className="text-muted-foreground text-sm">Carregando...</div>
        ) : matches.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Nenhuma rodada registrada.</div>
        ) : (
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-medium w-20">Rodada</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-medium w-32">Data</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-medium">Notas</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-medium w-24 text-center">Jogadores</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.map(m => (
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
