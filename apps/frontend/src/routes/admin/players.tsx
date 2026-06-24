import { createRoute, useNavigate } from '@tanstack/react-router'
import { rootRoute } from '../__root'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Player } from '@cedh-pox/shared'
import { fetchPlayers, createPlayer, updatePlayer, deletePlayer } from '../../lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Link } from '@tanstack/react-router'
import { ChevronLeft, Pencil, Trash2, UserPlus, Check, X } from 'lucide-react'

export const adminPlayersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/players',
  component: PlayersPage,
})

function PlayersPage() {
  const navigate = useNavigate()
  const hasToken = !!localStorage.getItem('admin_token')

  if (!hasToken) {
    navigate({ to: '/admin' })
    return null
  }

  function handleUnauthorized() {
    localStorage.removeItem('admin_token')
    navigate({ to: '/admin' })
  }

  return <PlayerManagement onUnauthorized={handleUnauthorized} />
}

interface Props {
  onUnauthorized: () => void
}

function PlayerManagement({ onUnauthorized }: Props) {
  const qc = useQueryClient()
  const { data: players = [], isLoading } = useQuery({
    queryKey: ['admin-players'],
    queryFn: fetchPlayers,
  })

  const [newName, setNewName] = useState('')
  const [addError, setAddError] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editError, setEditError] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [deleteError, setDeleteError] = useState<Record<number, string>>({})

  const addMutation = useMutation({
    mutationFn: () => createPlayer(newName.trim()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-players'] })
      setNewName('')
      setAddError('')
    },
    onError: (e) => {
      if ((e as Error).message === 'UNAUTHORIZED') { onUnauthorized(); return }
      setAddError((e as Error).message)
    },
  })

  const editMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => updatePlayer(id, name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-players'] })
      setEditingId(null)
      setEditName('')
      setEditError('')
    },
    onError: (e) => {
      if ((e as Error).message === 'UNAUTHORIZED') { onUnauthorized(); return }
      setEditError((e as Error).message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletePlayer(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['admin-players'] })
      setConfirmDeleteId(null)
      setDeleteError(prev => { const n = { ...prev }; delete n[id]; return n })
    },
    onError: (e, id) => {
      if ((e as Error).message === 'UNAUTHORIZED') { onUnauthorized(); return }
      setConfirmDeleteId(null)
      setDeleteError(prev => ({ ...prev, [id]: (e as Error).message }))
    },
  })

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) { setAddError('Nome obrigatório'); return }
    addMutation.mutate()
  }

  function startEdit(player: Player) {
    setEditingId(player.id)
    setEditName(player.name)
    setEditError('')
    setConfirmDeleteId(null)
  }

  function confirmEdit(id: number) {
    if (!editName.trim()) { setEditError('Nome obrigatório'); return }
    editMutation.mutate({ id, name: editName.trim() })
  }

  function handleDelete(id: number) {
    if (confirmDeleteId === id) {
      deleteMutation.mutate(id)
    } else {
      setConfirmDeleteId(id)
      setEditingId(null)
      setDeleteError(prev => { const n = { ...prev }; delete n[id]; return n })
    }
  }

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
        <h1 className="text-xl font-semibold">Participantes</h1>
      </div>

      {/* Add player form */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-muted-foreground" />
            Novo Participante
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex items-end gap-3">
            <div className="space-y-1.5 flex-1 max-w-xs">
              <Label htmlFor="new-player-name">Nome</Label>
              <Input
                id="new-player-name"
                value={newName}
                onChange={e => { setNewName(e.target.value); setAddError('') }}
                placeholder="ex: Lucas"
              />
            </div>
            <Button type="submit" size="sm" disabled={addMutation.isPending}>
              {addMutation.isPending ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </form>
          {addError && <p className="text-destructive text-xs mt-2">{addError}</p>}
        </CardContent>
      </Card>

      {/* Players table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Jogadores cadastrados</h2>
          <Badge variant="secondary">{players.length}</Badge>
        </div>
        <Separator className="bg-border/50" />
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-medium">Nome</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-medium w-44">Cadastrado em</TableHead>
                <TableHead className="w-32" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground text-sm">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : players.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground text-sm">
                    Nenhum jogador cadastrado ainda.
                  </TableCell>
                </TableRow>
              ) : (
                players.map(player => (
                  <TableRow key={player.id} className="border-border/30 hover:bg-muted/20 transition-colors">
                    <TableCell className="py-3">
                      {editingId === player.id ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Input
                              value={editName}
                              onChange={e => { setEditName(e.target.value); setEditError('') }}
                              className="h-7 text-sm max-w-[200px]"
                              autoFocus
                              onKeyDown={e => {
                                if (e.key === 'Enter') confirmEdit(player.id)
                                if (e.key === 'Escape') { setEditingId(null); setEditError('') }
                              }}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-emerald-500 hover:text-emerald-400"
                              onClick={() => confirmEdit(player.id)}
                              disabled={editMutation.isPending}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => { setEditingId(null); setEditError('') }}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          {editError && <p className="text-destructive text-xs">{editError}</p>}
                        </div>
                      ) : (
                        <span className="font-medium">{player.name}</span>
                      )}
                    </TableCell>
                    <TableCell className="py-3 text-muted-foreground text-sm">
                      {new Date(player.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="py-3">
                      {editingId !== player.id && (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => startEdit(player)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          {confirmDeleteId === player.id ? (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-7 text-xs px-2"
                                onClick={() => handleDelete(player.id)}
                                disabled={deleteMutation.isPending}
                              >
                                Confirmar
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs px-2"
                                onClick={() => setConfirmDeleteId(null)}
                              >
                                Cancelar
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDelete(player.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      )}
                      {deleteError[player.id] && (
                        <p className="text-destructive text-xs mt-1 text-right">{deleteError[player.id]}</p>
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
