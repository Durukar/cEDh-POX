import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createEntry, fetchPlayers } from '../../lib/api'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDown, Plus, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AddEntryFormProps {
  matchId: number
}

function NativeSelect({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          'h-8 w-full appearance-none rounded-lg border border-input bg-transparent pl-2.5 pr-7 py-1 text-sm text-foreground transition-colors outline-none focus:border-ring focus:ring-3 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}

export function AddEntryForm({ matchId }: AddEntryFormProps) {
  const qc = useQueryClient()
  const [playerId, setPlayerId] = useState('')
  const [commander, setCommander] = useState('')
  const [status, setStatus] = useState<'active' | 'disband'>('active')
  const [result, setResult] = useState<'win' | 'draw' | 'loss' | 'none'>('none')
  const [error, setError] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [dropdownRect, setDropdownRect] = useState({ top: 0, left: 0, width: 0 })
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: players = [] } = useQuery({
    queryKey: ['admin-players'],
    queryFn: fetchPlayers,
  })

  const mutation = useMutation({
    mutationFn: () => createEntry(matchId, {
      player_id: Number(playerId),
      commander_name: commander || undefined,
      status,
      result,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-match', matchId] })
      setPlayerId(''); setCommander(''); setStatus('active'); setResult('none'); setError('')
      setSuggestions([]); setShowSuggestions(false)
    },
    onError: (e) => {
      setError((e as Error).message)
    },
  })

  function handleCommanderChange(value: string) {
    setCommander(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.length < 2) { setSuggestions([]); setShowSuggestions(false); return }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(value)}`)
        if (res.ok) {
          const json = await res.json() as { data: string[] }
          const data = json.data?.slice(0, 8) ?? []
          setSuggestions(data)
          if (data.length > 0 && inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect()
            setDropdownRect({ top: rect.bottom + 4, left: rect.left, width: rect.width })
            setShowSuggestions(true)
          } else {
            setShowSuggestions(false)
          }
        }
      } catch {
        setSuggestions([])
      }
    }, 300)
  }

  function selectSuggestion(name: string) {
    setCommander(name)
    setSuggestions([])
    setShowSuggestions(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!playerId) { setError('Selecione um jogador'); return }
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
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1.5 min-w-40 flex-1">
            <Label>Jogador</Label>
            <NativeSelect value={playerId} onChange={e => { setPlayerId(e.target.value); setError('') }}>
              <option value="" disabled>Selecionar...</option>
              {players.map(p => (
                <option key={p.id} value={String(p.id)}>{p.name}</option>
              ))}
            </NativeSelect>
          </div>
          <div className="space-y-1.5 min-w-48 flex-[2]">
            <Label htmlFor="add-commander">
              Comandante <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              ref={inputRef}
              id="add-commander"
              value={commander}
              onChange={e => handleCommanderChange(e.target.value)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="ex: Thrasios & Tymna"
              autoComplete="off"
            />
          </div>
          <div className="space-y-1.5 w-28">
            <Label>Status</Label>
            <NativeSelect value={status} onChange={e => setStatus(e.target.value as 'active' | 'disband')}>
              <option value="active">Ativo</option>
              <option value="disband">Desistiu</option>
            </NativeSelect>
          </div>
          <div className="space-y-1.5 w-28">
            <Label>Resultado</Label>
            <NativeSelect value={result} onChange={e => setResult(e.target.value as 'win' | 'draw' | 'loss' | 'none')}>
              <option value="none">—</option>
              <option value="win">Vitória</option>
              <option value="draw">Empate</option>
              <option value="loss">Derrota</option>
            </NativeSelect>
          </div>
          <Button type="submit" size="sm" disabled={mutation.isPending}>
            <Plus className="h-4 w-4 mr-1" />
            {mutation.isPending ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </form>
        {error && <p className="text-destructive text-xs mt-2">{error}</p>}
      </CardContent>

      {showSuggestions && suggestions.length > 0 && createPortal(
        <ul
          style={{ top: dropdownRect.top, left: dropdownRect.left, width: dropdownRect.width }}
          className="fixed z-[9999] rounded-lg border border-border bg-popover shadow-lg overflow-hidden"
        >
          {suggestions.map(name => (
            <li
              key={name}
              onMouseDown={() => selectSuggestion(name)}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-muted transition-colors"
            >
              {name}
            </li>
          ))}
        </ul>,
        document.body,
      )}
    </Card>
  )
}
