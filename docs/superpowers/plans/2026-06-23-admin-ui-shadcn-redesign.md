# Admin UI Shadcn Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the 5 admin components of the cEDH tournament portal using shadcn/ui components for a dark-themed, polished look.

**Architecture:** Install missing shadcn components (card, label, select, dialog, separator, button), then overwrite all 5 admin component files with the new implementations that import from `@/components/ui/*`. The `@/` alias resolves to `apps/frontend/src/` per the tsconfig/vite config.

**Tech Stack:** React 19, shadcn/ui (base-nova style), Tailwind CSS, TanStack Query, TanStack Router, Lucide React, TypeScript

## Global Constraints

- shadcn style: `base-nova`, dark theme, `cssVariables: true`
- All shadcn component imports use `@/components/ui/<name>` alias
- Working directory for all commands: `/Users/ldev/www/cEDh-POX/apps/frontend`
- bun is the package manager (use `bun run build`, `bunx shadcn@latest add`)
- No test files — this is a UI rewrite with a build-verify workflow
- Portuguese UI strings must be preserved as specified

---

### Task 1: Install missing shadcn components

**Files:**
- Create: `src/components/ui/button.tsx` (already exists — shadcn may skip or overwrite)
- Create: `src/components/ui/card.tsx`
- Create: `src/components/ui/label.tsx`
- Create: `src/components/ui/select.tsx`
- Create: `src/components/ui/dialog.tsx`
- Create: `src/components/ui/separator.tsx`

**Interfaces:**
- Produces: `Card`, `CardContent`, `CardDescription`, `CardHeader`, `CardTitle` from `@/components/ui/card`
- Produces: `Label` from `@/components/ui/label`
- Produces: `Button` from `@/components/ui/button`
- Produces: `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` from `@/components/ui/select`
- Produces: `Dialog`, `DialogContent`, `DialogFooter`, `DialogHeader`, `DialogTitle` from `@/components/ui/dialog`
- Produces: `Separator` from `@/components/ui/separator`

- [ ] **Step 1: Run shadcn add**

```bash
cd /Users/ldev/www/cEDh-POX/apps/frontend
bunx shadcn@latest add button card label select dialog separator --yes
```

Expected: Each component is created/updated in `src/components/ui/`. May prompt — answer yes to all.

- [ ] **Step 2: Verify components exist**

```bash
ls /Users/ldev/www/cEDh-POX/apps/frontend/src/components/ui/
```

Expected output includes: `badge.tsx  button.tsx  card.tsx  dialog.tsx  input.tsx  label.tsx  select.tsx  separator.tsx  skeleton.tsx  table.tsx`

---

### Task 2: Rewrite TokenGate.tsx

**Files:**
- Modify: `src/components/admin/TokenGate.tsx`

**Interfaces:**
- Consumes: `Card`, `CardContent`, `CardDescription`, `CardHeader`, `CardTitle` from `@/components/ui/card`; `Input` from `@/components/ui/input`; `Label` from `@/components/ui/label`; `Button` from `@/components/ui/button`; `ShieldCheck` from `lucide-react`
- Produces: `TokenGate({ onTokenSet: () => void })` — centered auth card component

- [ ] **Step 1: Overwrite the file**

Replace entire contents of `/Users/ldev/www/cEDh-POX/apps/frontend/src/components/admin/TokenGate.tsx` with:

```tsx
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ShieldCheck } from 'lucide-react'

interface TokenGateProps {
  onTokenSet: () => void
}

export function TokenGate({ onTokenSet }: TokenGateProps) {
  const [token, setToken] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token.trim()) { setError('Token obrigatório'); return }
    localStorage.setItem('admin_token', token.trim())
    onTokenSet()
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="w-full max-w-sm border-border/50">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <ShieldCheck className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-lg">Acesso Admin</CardTitle>
          <CardDescription>Digite o token para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="token">Token</Label>
              <Input
                id="token"
                type="password"
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="••••••••"
                autoFocus
              />
              {error && <p className="text-destructive text-xs">{error}</p>}
            </div>
            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

### Task 3: Rewrite CreateMatchForm.tsx

**Files:**
- Modify: `src/components/admin/CreateMatchForm.tsx`

**Interfaces:**
- Consumes: `Input` from `@/components/ui/input`; `Label` from `@/components/ui/label`; `Button` from `@/components/ui/button`; `Plus` from `lucide-react`; `createMatch` from `../../lib/api`; `useMutation`, `useQueryClient` from `@tanstack/react-query`
- Produces: `CreateMatchForm({ onUnauthorized: () => void })` — inline form for creating matches

- [ ] **Step 1: Overwrite the file**

Replace entire contents of `/Users/ldev/www/cEDh-POX/apps/frontend/src/components/admin/CreateMatchForm.tsx` with:

```tsx
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createMatch } from '../../lib/api'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export function CreateMatchForm({ onUnauthorized }: { onUnauthorized: () => void }) {
  const qc = useQueryClient()
  const [matchNumber, setMatchNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: createMatch,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-matches'] })
      setMatchNumber(''); setNotes(''); setError('')
    },
    onError: (e) => {
      if ((e as Error).message === 'UNAUTHORIZED') { onUnauthorized(); return }
      setError((e as Error).message)
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const num = parseInt(matchNumber)
    if (isNaN(num) || num <= 0) { setError('Match number must be a positive integer'); return }
    mutation.mutate({ match_number: num, notes: notes || undefined })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
      <div className="space-y-1.5">
        <Label htmlFor="match-number">Partida #</Label>
        <Input
          id="match-number"
          type="number"
          value={matchNumber}
          onChange={e => setMatchNumber(e.target.value)}
          className="w-28"
          placeholder="1"
          min={1}
        />
      </div>
      <div className="space-y-1.5 flex-1 min-w-48">
        <Label htmlFor="notes">Notas <span className="text-muted-foreground">(opcional)</span></Label>
        <Input
          id="notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Observações da rodada..."
        />
      </div>
      <Button type="submit" disabled={mutation.isPending}>
        <Plus className="h-4 w-4 mr-1" />
        {mutation.isPending ? 'Criando...' : 'Criar Partida'}
      </Button>
      {error && <p className="text-destructive text-xs self-center">{error}</p>}
    </form>
  )
}
```

---

### Task 4: Rewrite MatchList.tsx

**Files:**
- Modify: `src/components/admin/MatchList.tsx`

**Interfaces:**
- Consumes: `Card`, `CardContent`, `CardHeader`, `CardTitle`; `Button`; `Badge`; `Separator`; `Table`, `TableBody`, `TableCell`, `TableHead`, `TableHeader`, `TableRow`; `Eye`, `Trash2` from `lucide-react`; `CreateMatchForm` from `./CreateMatchForm`; `fetchMatches`, `deleteMatch` from `../../lib/api`; `Link` from `@tanstack/react-router`
- Produces: `AdminDashboard({ onUnauthorized: () => void })` — main dashboard with match list

- [ ] **Step 1: Overwrite the file**

Replace entire contents of `/Users/ldev/www/cEDh-POX/apps/frontend/src/components/admin/MatchList.tsx` with:

```tsx
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
                        <Button variant="ghost" size="sm" asChild>
                          <Link to="/admin/matches/$matchId" params={{ matchId: String(m.id) }}>
                            <Eye className="h-3.5 w-3.5 mr-1.5" />
                            Ver
                          </Link>
                        </Button>
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
```

---

### Task 5: Rewrite AddEntryForm.tsx

**Files:**
- Modify: `src/components/admin/AddEntryForm.tsx`

**Interfaces:**
- Consumes: `Input`; `Label`; `Button`; `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`; `Card`, `CardContent`, `CardHeader`, `CardTitle`; `UserPlus` from `lucide-react`; `createEntry` from `../../lib/api`
- Produces: `AddEntryForm({ matchId: number, onUnauthorized: () => void })` — card form to add a player to a match

- [ ] **Step 1: Overwrite the file**

Replace entire contents of `/Users/ldev/www/cEDh-POX/apps/frontend/src/components/admin/AddEntryForm.tsx` with:

```tsx
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createEntry } from '../../lib/api'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserPlus } from 'lucide-react'

interface AddEntryFormProps {
  matchId: number
  onUnauthorized: () => void
}

export function AddEntryForm({ matchId, onUnauthorized }: AddEntryFormProps) {
  const qc = useQueryClient()
  const [playerName, setPlayerName] = useState('')
  const [commander, setCommander] = useState('')
  const [status, setStatus] = useState<'active' | 'disband'>('active')
  const [result, setResult] = useState<'win' | 'draw' | 'loss' | 'none'>('none')
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: () => createEntry(matchId, {
      player_name: playerName,
      commander_name: commander || undefined,
      status,
      result,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-matches'] })
      setPlayerName(''); setCommander(''); setStatus('active'); setResult('none'); setError('')
    },
    onError: (e) => {
      if ((e as Error).message === 'UNAUTHORIZED') { onUnauthorized(); return }
      setError((e as Error).message)
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!playerName.trim()) { setError('Nome do jogador obrigatório'); return }
    mutation.mutate()
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-muted-foreground" />
          Adicionar Jogador
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="player-name">Jogador</Label>
              <Input
                id="player-name"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                placeholder="Nome do jogador"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="commander">Comandante <span className="text-muted-foreground">(opcional)</span></Label>
              <Input
                id="commander"
                value={commander}
                onChange={e => setCommander(e.target.value)}
                placeholder="ex: Thrasios & Tymna"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={v => setStatus(v as 'active' | 'disband')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="disband">Desistiu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Resultado</Label>
              <Select value={result} onValueChange={v => setResult(v as 'win' | 'draw' | 'loss' | 'none')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  <SelectItem value="win">Vitória</SelectItem>
                  <SelectItem value="draw">Empate</SelectItem>
                  <SelectItem value="loss">Derrota</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {error && <p className="text-destructive text-xs">{error}</p>}
          <Button type="submit" disabled={mutation.isPending} size="sm">
            {mutation.isPending ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

---

### Task 6: Rewrite EditEntryModal.tsx

**Files:**
- Modify: `src/components/admin/EditEntryModal.tsx`

**Interfaces:**
- Consumes: `Input`; `Label`; `Button`; `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`; `Dialog`, `DialogContent`, `DialogFooter`, `DialogHeader`, `DialogTitle`; `updateEntry` from `../../lib/api`; `MatchEntry` from `@cedh-pox/shared`
- Produces: `EditEntryModal({ entry: MatchEntry, matchId: number, onClose: () => void, onUnauthorized: () => void })` — modal dialog for editing an entry

- [ ] **Step 1: Overwrite the file**

Replace entire contents of `/Users/ldev/www/cEDh-POX/apps/frontend/src/components/admin/EditEntryModal.tsx` with:

```tsx
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateEntry } from '../../lib/api'
import type { MatchEntry } from '@cedh-pox/shared'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

interface Props {
  entry: MatchEntry
  matchId: number
  onClose: () => void
  onUnauthorized: () => void
}

export function EditEntryModal({ entry, matchId, onClose, onUnauthorized }: Props) {
  const qc = useQueryClient()
  const [commander, setCommander] = useState(entry.commander_name ?? '')
  const [status, setStatus] = useState(entry.status)
  const [result, setResult] = useState(entry.result)
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: () => updateEntry(matchId, entry.id, { commander_name: commander || undefined, status, result }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-matches'] }); onClose() },
    onError: (e) => {
      if ((e as Error).message === 'UNAUTHORIZED') { onUnauthorized(); return }
      setError((e as Error).message)
    },
  })

  return (
    <Dialog open onOpenChange={open => { if (!open) onClose() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Editar: {entry.player_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-commander">Comandante</Label>
            <Input
              id="edit-commander"
              value={commander}
              onChange={e => setCommander(e.target.value)}
              placeholder="ex: Thrasios & Tymna"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={v => setStatus(v as 'active' | 'disband')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="disband">Desistiu</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Resultado</Label>
            <Select value={result} onValueChange={v => setResult(v as 'win' | 'draw' | 'loss' | 'none')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                <SelectItem value="win">Vitória</SelectItem>
                <SelectItem value="draw">Empate</SelectItem>
                <SelectItem value="loss">Derrota</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-destructive text-xs">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

---

### Task 7: Rewrite MatchDetail.tsx

**Files:**
- Modify: `src/components/admin/MatchDetail.tsx`

**Interfaces:**
- Consumes: `Button`; `Badge`; `Separator`; `Table`, `TableBody`, `TableCell`, `TableHead`, `TableHeader`, `TableRow`; `ChevronLeft`, `Pencil` from `lucide-react`; `cn` from `@/lib/utils`; `AddEntryForm` from `./AddEntryForm`; `EditEntryModal` from `./EditEntryModal`; `fetchMatches` from `../../lib/api`; `MatchEntry` from `@cedh-pox/shared`; `Link` from `@tanstack/react-router`
- Produces: `MatchDetail({ matchId: number, onUnauthorized: () => void })` — full match view with entry table and edit modal

- [ ] **Step 1: Overwrite the file**

Replace entire contents of `/Users/ldev/www/cEDh-POX/apps/frontend/src/components/admin/MatchDetail.tsx` with:

```tsx
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
        <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
          <Link to="/admin">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar
          </Link>
        </Button>
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
```

---

### Task 8: Build verification and commit

**Files:** none new

- [ ] **Step 1: Run the build**

```bash
cd /Users/ldev/www/cEDh-POX/apps/frontend && bun run build
```

Expected: `✓ built in Xs` with no TypeScript errors. If errors appear, fix them before committing.

- [ ] **Step 2: Commit**

```bash
cd /Users/ldev/www/cEDh-POX && git add apps/frontend/src/components/admin/ apps/frontend/src/components/ui/
git commit -m "feat: redesign admin UI with shadcn components"
```
