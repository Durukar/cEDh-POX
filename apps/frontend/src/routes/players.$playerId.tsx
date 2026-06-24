import { createRoute, useParams, Link } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { useQuery } from '@tanstack/react-query'
import { fetchPlayerProfile } from '../lib/api'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChevronLeft, Trophy, Swords, Minus, X } from 'lucide-react'

export const playerProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/jogadores/$playerId',
  component: PlayerProfilePage,
})

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-border/50 px-4 py-3 text-center">
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  )
}

function PlayerProfilePage() {
  const { playerId } = useParams({ from: '/jogadores/$playerId' })
  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['player-profile', Number(playerId)],
    queryFn: () => fetchPlayerProfile(Number(playerId)),
  })

  if (isLoading) return <div className="text-muted-foreground text-sm py-8">Carregando...</div>
  if (isError || !profile) return <div className="text-muted-foreground text-sm py-8">Jogador não encontrado.</div>

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
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{profile.name}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Membro desde {new Date(profile.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Career stats */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold">Estatísticas</h2>
        <Separator className="bg-border/50" />
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          <StatCard label="Pontos" value={profile.career.total_points} />
          <StatCard label="Vitórias" value={profile.career.wins} />
          <StatCard label="Empates" value={profile.career.draws} />
          <StatCard label="Derrotas" value={profile.career.losses} />
          <StatCard label="Rodadas" value={profile.career.matches_played} />
          <StatCard label="Torneios" value={profile.career.tournaments_played} />
        </div>
      </div>

      {/* Tournament history */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold">Histórico de Campeonatos</h2>
        <Separator className="bg-border/50" />
        {profile.tournaments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Nenhum campeonato jogado ainda.
          </div>
        ) : (
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-medium">Campeonato</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-medium w-16 text-center">Pos.</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-medium w-16 text-right">Pts</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-medium w-10 text-center">
                    <Trophy className="h-3.5 w-3.5 mx-auto" />
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-medium w-10 text-center">
                    <Minus className="h-3.5 w-3.5 mx-auto" />
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-medium w-10 text-center">
                    <X className="h-3.5 w-3.5 mx-auto" />
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-medium">Comandantes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profile.tournaments.map(t => (
                  <TableRow key={t.tournament_id} className="border-border/30 hover:bg-muted/20 transition-colors">
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          to="/campeonatos/$tournamentId"
                          params={{ tournamentId: String(t.tournament_id) }}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {t.tournament_name}
                        </Link>
                        <Badge
                          variant={t.tournament_status === 'active' ? 'default' : 'secondary'}
                          className={`text-xs ${t.tournament_status === 'active' ? 'border-emerald-800 text-emerald-400 bg-emerald-950/40' : ''}`}
                        >
                          {t.tournament_status === 'active' ? 'Ativo' : 'Encerrado'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      {t.rank > 0 ? (
                        <span className="tabular-nums font-medium">{t.rank}º</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="py-3 text-right font-bold tabular-nums">{t.total_points}</TableCell>
                    <TableCell className="py-3 text-center tabular-nums text-muted-foreground">{t.wins}</TableCell>
                    <TableCell className="py-3 text-center tabular-nums text-muted-foreground">{t.draws}</TableCell>
                    <TableCell className="py-3 text-center tabular-nums text-muted-foreground">{t.losses}</TableCell>
                    <TableCell className="py-3 text-muted-foreground text-sm">
                      {t.commanders.length > 0 ? t.commanders.join(' · ') : '—'}
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
