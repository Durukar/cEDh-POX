import { createRoute, Link } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { useQuery } from '@tanstack/react-query'
import { fetchTournaments } from '../lib/api'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Trophy, ChevronRight } from 'lucide-react'

export const tournamentsIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/campeonatos',
  component: TournamentsPage,
})

function TournamentsPage() {
  const { data: tournaments = [], isLoading } = useQuery({
    queryKey: ['tournaments'],
    queryFn: fetchTournaments,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Campeonatos</h1>
        <p className="text-muted-foreground text-sm mt-1">Histórico de temporadas cEDH-POX</p>
      </div>
      <Separator className="bg-border/50" />

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : tournaments.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          Nenhum campeonato disponível ainda.
        </div>
      ) : (
        <div className="space-y-2">
          {tournaments.map(t => (
            <Link
              key={t.id}
              to="/campeonatos/$tournamentId"
              params={{ tournamentId: String(t.id) }}
              className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3 hover:bg-muted/30 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Trophy className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="font-medium text-sm">{t.name}</p>
                  {t.description && (
                    <p className="text-xs text-muted-foreground">{t.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant={t.status === 'active' ? 'default' : 'secondary'}
                  className={t.status === 'active' ? 'border-emerald-800 text-emerald-400 bg-emerald-950/40' : ''}
                >
                  {t.status === 'active' ? 'Ativo' : 'Encerrado'}
                </Badge>
                <span className="text-xs text-muted-foreground">{t.match_count ?? 0} rodadas</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
