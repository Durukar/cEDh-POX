import { useNavigate, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchAdminTournaments } from '../../lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Eye, Trophy, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AdminDashboard() {
  const navigate = useNavigate()
  const { data: tournaments = [], isLoading } = useQuery({
    queryKey: ['admin-tournaments'],
    queryFn: fetchAdminTournaments,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie os campeonatos e jogadores</p>
        </div>
        <Link
          to="/admin/players"
          className="inline-flex items-center h-9 gap-2 rounded-md px-3 text-sm font-medium border border-border/50 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
        >
          <Users className="h-4 w-4" />
          Participantes
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card
          className="border-border/50 cursor-pointer hover:bg-muted/20 transition-colors"
          onClick={() => navigate({ to: '/admin/tournaments' })}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <Trophy className="h-4 w-4" />
              Campeonatos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{tournaments.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {tournaments.filter(t => t.status === 'active').length} ativo(s)
            </p>
          </CardContent>
        </Card>
        <Card
          className="border-border/50 cursor-pointer hover:bg-muted/20 transition-colors"
          onClick={() => navigate({ to: '/admin/players' })}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              Participantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">—</p>
            <p className="text-xs text-muted-foreground mt-1">Gerenciar jogadores</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Campeonatos</h2>
          <Badge variant="secondary">{tournaments.length}</Badge>
        </div>
        <Separator className="bg-border/50" />
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-medium">Nome</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-medium w-24 text-center">Status</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-medium w-24 text-center">Rodadas</TableHead>
                <TableHead className="w-32" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground text-sm">Carregando...</TableCell></TableRow>
              ) : tournaments.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground text-sm">Nenhum campeonato ainda.</TableCell></TableRow>
              ) : (
                tournaments.map(t => (
                  <TableRow key={t.id} className="border-border/30 hover:bg-muted/20 transition-colors">
                    <TableCell className="py-3 font-medium">{t.name}</TableCell>
                    <TableCell className="py-3 text-center">
                      <Badge
                        variant={t.status === 'active' ? 'default' : 'secondary'}
                        className={cn('text-xs', t.status === 'active' && 'border-emerald-800 text-emerald-400 bg-emerald-950/40')}
                      >
                        {t.status === 'active' ? 'Ativo' : 'Encerrado'}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <Badge variant="secondary" className="text-xs">{t.match_count ?? 0}</Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex justify-end">
                        <Link
                          to="/admin/tournaments/$tournamentId"
                          params={{ tournamentId: String(t.id) }}
                          className="inline-flex items-center h-7 gap-1 rounded-md px-2.5 text-xs font-medium transition-all hover:bg-muted hover:text-foreground text-muted-foreground"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Gerenciar
                        </Link>
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
