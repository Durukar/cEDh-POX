import { createRoute, Link } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { useQuery } from '@tanstack/react-query'
import { fetchGlobalStandings } from '../lib/api'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GlobalStandingsEntry } from '@cedh-pox/shared'

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

const rankStyle: Record<number, { chip: string; row: string }> = {
  1: {
    chip: 'bg-yellow-500/15 text-yellow-400 ring-1 ring-yellow-500/30',
    row: 'border-l-2 border-l-yellow-500/40',
  },
  2: {
    chip: 'bg-slate-400/10 text-slate-300 ring-1 ring-slate-400/30',
    row: 'border-l-2 border-l-slate-400/40',
  },
  3: {
    chip: 'bg-amber-600/10 text-amber-500 ring-1 ring-amber-600/30',
    row: 'border-l-2 border-l-amber-600/40',
  },
}

function RankChip({ rank }: { rank: number }) {
  const style = rankStyle[rank]
  return style ? (
    <span className={cn('inline-flex items-center justify-center h-7 w-7 text-sm font-bold', style.chip)}>
      {rank}
    </span>
  ) : (
    <span className="text-sm tabular-nums text-muted-foreground/40 font-medium pl-1">{rank}</span>
  )
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  return (
    <div className="h-9 w-9 bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0 select-none">
      {initials}
    </div>
  )
}

function PlayerRow({ s }: { s: GlobalStandingsEntry }) {
  const meta = rankStyle[s.rank]
  return (
    <div
      className={cn(
        'group grid items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/20',
        'grid-cols-[36px_1fr_64px_160px_32px]',
        meta?.row,
        !meta && 'border-l-2 border-l-transparent',
      )}
    >
      {/* Rank */}
      <div className="flex justify-center">
        <RankChip rank={s.rank} />
      </div>

      {/* Player */}
      <div className="flex items-center gap-3 min-w-0">
        <Avatar name={s.player_name} />
        <div className="min-w-0">
          <p className="font-semibold text-sm leading-tight truncate">{s.player_name}</p>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">
            {s.matches_played} {s.matches_played === 1 ? 'rodada' : 'rodadas'}
            {' · '}
            {s.tournaments_played} {s.tournaments_played === 1 ? 'campeonato' : 'campeonatos'}
          </p>
        </div>
      </div>

      {/* Points */}
      <div className="text-right leading-none">
        <p className="text-2xl font-bold tabular-nums tracking-tight">{s.total_points}</p>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mt-0.5">pts</p>
      </div>

      {/* W / D / L */}
      <div className="flex items-center justify-center gap-3">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-sm font-semibold tabular-nums text-emerald-400">{s.wins}</span>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground/40">V</span>
        </div>
        <span className="text-border/60 text-xs select-none">·</span>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-sm font-semibold tabular-nums text-amber-400">{s.draws}</span>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground/40">E</span>
        </div>
        <span className="text-border/60 text-xs select-none">·</span>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-sm font-semibold tabular-nums text-rose-400">{s.losses}</span>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground/40">D</span>
        </div>
      </div>

      {/* Navigate */}
      <Link
        to="/jogadores/$playerId"
        params={{ playerId: String(s.player_id) }}
        className="inline-flex items-center justify-center h-7 w-7 text-muted-foreground/40 hover:bg-muted hover:text-foreground transition-colors"
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

function HomePage() {
  const { data: standings = [], isLoading } = useQuery({
    queryKey: ['global-standings'],
    queryFn: fetchGlobalStandings,
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground/40 font-medium mb-1.5">Ranking</p>
          <h1 className="text-3xl font-bold tracking-tight">Classificação Geral</h1>
          <p className="text-sm text-muted-foreground mt-1.5">Pontuação acumulada de todos os campeonatos da POX</p>
        </div>
        <Link
          to="/campeonatos"
          className="mb-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Campeonatos →
        </Link>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="border border-border/50 h-48 flex items-center justify-center text-sm text-muted-foreground">
          Carregando...
        </div>
      ) : standings.length === 0 ? (
        <div className="border border-border/50 h-48 flex items-center justify-center text-sm text-muted-foreground">
          Nenhum jogador cadastrado ainda.
        </div>
      ) : (
        <div className="border border-border/50 overflow-hidden">
          {/* Column headers */}
          <div className="grid grid-cols-[36px_1fr_64px_160px_32px] gap-4 px-5 py-2 border-b border-border/50">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-semibold text-center">#</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-semibold">Jogador</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-semibold text-right">Pts</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-semibold text-center">KDA</span>
            <span />
          </div>

          {/* Rows */}
          <div className="divide-y divide-border/30">
            {standings.map(s => <PlayerRow key={s.player_id} s={s} />)}
          </div>
        </div>
      )}
    </div>
  )
}
