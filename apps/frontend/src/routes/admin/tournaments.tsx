import { createRoute, Link, useNavigate } from '@tanstack/react-router'
import { rootRoute } from '../__root'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchAdminTournaments, createTournament, updateTournament, deleteTournament } from '../../lib/api'
import type { Tournament } from '@cedh-pox/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Pencil, Trash2, Check, X, Eye, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

export const adminTournamentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/tournaments',
  component: AdminTournamentsPage,
})

function AdminTournamentsPage() {
  const navigate = useNavigate()
  const hasToken = !!localStorage.getItem('admin_token')
  if (!hasToken) { navigate({ to: '/admin' }); return null }

  function handleUnauthorized() {
    localStorage.removeItem('admin_token')
    navigate({ to: '/admin' })
  }

  return <TournamentManagement onUnauthorized={handleUnauthorized} />
}

function TournamentManagement({ onUnauthorized }: { onUnauthorized: () => void }) {
  const qc = useQueryClient()
  const { data: tournaments = [], isLoading } = useQuery({
    queryKey: ['admin-tournaments'],
    queryFn: fetchAdminTournaments,
  })

  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [addError, setAddError] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editError, setEditError] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [deleteError, setDeleteError] = useState<Record<number, string>>({})

  const addMutation = useMutation({
    mutationFn: () => createTournament({ name: newName.trim(), description: newDesc.trim() || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tournaments'] }); setNewName(''); setNewDesc(''); setAddError('') },
    onError: (e) => { if ((e as Error).message === 'UNAUTHORIZED') { onUnauthorized(); return }; setAddError((e as Error).message) },
  })

  const editMutation = useMutation({
    mutationFn: ({ id, name, description }: { id: number; name: string; description: string }) =>
      updateTournament(id, { name, description: description || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tournaments'] }); setEditingId(null); setEditError('') },
    onError: (e) => { if ((e as Error).message === 'UNAUTHORIZED') { onUnauthorized(); return }; setEditError((e as Error).message) },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'active' | 'finished' }) => updateTournament(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-tournaments'] }),
    onError: (e) => { if ((e as Error).message === 'UNAUTHORIZED') onUnauthorized() },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTournament(id),
    onSuccess: (_d, id) => { qc.invalidateQueries({ queryKey: ['admin-tournaments'] }); setConfirmDeleteId(null); setDeleteError(prev => { const n = { ...prev }; delete n[id]; return n }) },
    onError: (e, id) => { if ((e as Error).message === 'UNAUTHORIZED') { onUnauthorized(); return }; setConfirmDeleteId(null); setDeleteError(prev => ({ ...prev, [id]: (e as Error).message })) },
  })

  function startEdit(t: Tournament) {
    setEditingId(t.id); setEditName(t.name); setEditDesc(t.description ?? ''); setEditError(''); setConfirmDeleteId(null)
  }

  function handleDelete(id: number) {
    if (confirmDeleteId === id) { deleteMutation.mutate(id) }
    else { setConfirmDeleteId(id); setEditingId(null); setDeleteError(prev => { const n = { ...prev }; delete n[id]; return n }) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Campeonatos</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie as temporadas</p>
        </div>
        <Link
          to="/admin/players"
          className="inline-flex items-center h-9 gap-2 rounded-md px-3 text-sm font-medium border border-border/50 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
        >
          <Users className="h-4 w-4" />
          Participantes
        </Link>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Novo Campeonato</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={e => { e.preventDefault(); if (!newName.trim()) { setAddError('Nome obrigatório'); return }; addMutation.mutate() }} className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1.5 min-w-40 flex-1">
              <Label htmlFor="new-t-name">Nome</Label>
              <Input id="new-t-name" value={newName} onChange={e => { setNewName(e.target.value); setAddError('') }} placeholder="ex: POX — Temporada 2" />
            </div>
            <div className="space-y-1.5 min-w-48 flex-[2]">
              <Label htmlFor="new-t-desc">Descrição <span className="text-muted-foreground">(opcional)</span></Label>
              <Input id="new-t-desc" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="ex: Temporada de inverno 2025" />
            </div>
            <Button type="submit" size="sm" disabled={addMutation.isPending}>
              <Plus className="h-4 w-4 mr-1" />
              {addMutation.isPending ? 'Criando...' : 'Criar'}
            </Button>
          </form>
          {addError && <p className="text-destructive text-xs mt-2">{addError}</p>}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Temporadas</h2>
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
                <TableHead className="w-40" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground text-sm">Carregando...</TableCell></TableRow>
              ) : tournaments.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground text-sm">Nenhum campeonato criado ainda.</TableCell></TableRow>
              ) : (
                tournaments.map(t => (
                  <TableRow key={t.id} className="border-border/30 hover:bg-muted/20 transition-colors">
                    <TableCell className="py-3">
                      {editingId === t.id ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <Input value={editName} onChange={e => { setEditName(e.target.value); setEditError('') }} className="h-7 text-sm max-w-[200px]" autoFocus onKeyDown={e => { if (e.key === 'Enter') { if (!editName.trim()) { setEditError('Nome obrigatório'); return }; editMutation.mutate({ id: t.id, name: editName.trim(), description: editDesc }) }; if (e.key === 'Escape') setEditingId(null) }} />
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-emerald-500" onClick={() => { if (!editName.trim()) { setEditError('Nome obrigatório'); return }; editMutation.mutate({ id: t.id, name: editName.trim(), description: editDesc }) }} disabled={editMutation.isPending}><Check className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditingId(null)}><X className="h-3.5 w-3.5" /></Button>
                          </div>
                          <Input value={editDesc} onChange={e => setEditDesc(e.target.value)} className="h-7 text-sm max-w-[300px]" placeholder="Descrição (opcional)" />
                          {editError && <p className="text-destructive text-xs">{editError}</p>}
                        </div>
                      ) : (
                        <div>
                          <span className="font-medium">{t.name}</span>
                          {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <button
                        onClick={() => statusMutation.mutate({ id: t.id, status: t.status === 'active' ? 'finished' : 'active' })}
                        disabled={statusMutation.isPending}
                        title={t.status === 'active' ? 'Clique para encerrar' : 'Clique para reabrir'}
                        className={cn('cursor-pointer', statusMutation.isPending && 'opacity-50')}
                      >
                        <Badge
                          variant={t.status === 'active' ? 'default' : 'secondary'}
                          className={t.status === 'active' ? 'border-emerald-800 text-emerald-400 bg-emerald-950/40' : ''}
                        >
                          {t.status === 'active' ? 'Ativo' : 'Encerrado'}
                        </Badge>
                      </button>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <Badge variant="secondary" className="text-xs">{(t as Tournament & { match_count: number }).match_count ?? 0}</Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      {editingId !== t.id && (
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to="/admin/tournaments/$tournamentId"
                            params={{ tournamentId: String(t.id) }}
                            className="inline-flex items-center h-7 gap-1 rounded-md px-2.5 text-xs font-medium transition-all hover:bg-muted hover:text-foreground text-muted-foreground"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Gerenciar
                          </Link>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground" onClick={() => startEdit(t)}><Pencil className="h-3.5 w-3.5" /></Button>
                          {confirmDeleteId === t.id ? (
                            <div className="flex items-center gap-1">
                              <Button variant="destructive" size="sm" className="h-7 text-xs px-2" onClick={() => handleDelete(t.id)} disabled={deleteMutation.isPending}>Confirmar</Button>
                              <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={() => setConfirmDeleteId(null)}>Cancelar</Button>
                            </div>
                          ) : (
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(t.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          )}
                          {deleteError[t.id] && <p className="text-destructive text-xs mt-1">{deleteError[t.id]}</p>}
                        </div>
                      )}
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
