import { useState, useMemo } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { LeaderboardEntry } from '@cedh-pox/shared'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { LeaderboardSkeleton } from './LeaderboardSkeleton'
import { Input } from './ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'

// Avatar with initials, color based on name hash
function PlayerAvatar({ name }: { name: string }) {
  const colors = [
    'bg-blue-600', 'bg-violet-600', 'bg-emerald-600', 'bg-amber-600',
    'bg-rose-600', 'bg-cyan-600', 'bg-indigo-600', 'bg-teal-600',
  ]
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const color = colors[hash % colors.length]
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <span
      className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold text-white shrink-0 ${color}`}
    >
      {initials}
    </span>
  )
}

const columnHelper = createColumnHelper<LeaderboardEntry>()

const columns = [
  columnHelper.accessor('rank', {
    header: '#',
    cell: (info) => (
      <span className="text-muted-foreground tabular-nums">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor('player_name', {
    header: 'Player',
    filterFn: 'includesString',
    cell: (info) => {
      const entry = info.row.original
      const cmds = entry.commanders
      return (
        <div className="flex items-center gap-3">
          <PlayerAvatar name={info.getValue()} />
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-foreground truncate">{info.getValue()}</span>
            {cmds.length > 0 && (
              <span className="text-xs text-muted-foreground truncate">
                {cmds.join(' · ')}
              </span>
            )}
          </div>
        </div>
      )
    },
  }),
  columnHelper.accessor('total_points', {
    header: 'Pts',
    cell: (info) => (
      <span className="font-bold tabular-nums text-foreground">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor('wins', {
    header: 'W',
    cell: (info) => (
      <span className="tabular-nums text-muted-foreground">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor('draws', {
    header: 'D',
    cell: (info) => (
      <span className="tabular-nums text-muted-foreground">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor('losses', {
    header: 'L',
    cell: (info) => (
      <span className="tabular-nums text-muted-foreground">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor('matches_played', {
    header: 'Matches',
    cell: (info) => (
      <span className="tabular-nums text-muted-foreground">{info.getValue()}</span>
    ),
  }),
]

export function LeaderboardTable() {
  const { data, isLoading, isError } = useLeaderboard()
  const [globalFilter, setGlobalFilter] = useState('')

  const tableData = useMemo(() => data ?? [], [data])

  const table = useReactTable({
    data: tableData,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _colId, filterValue) =>
      row.original.player_name.toLowerCase().includes(filterValue.toLowerCase()),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  if (isLoading) return <LeaderboardSkeleton />

  if (isError) {
    return (
      <div className="text-center py-16 text-muted-foreground text-sm">
        Falha ao carregar o leaderboard.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header row: title + search */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Leaderboard</h1>
        <Input
          placeholder="Buscar jogador..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-56 h-8 text-sm bg-muted/40 border-border/50 placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Container card */}
      <div className="rounded-lg border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="border-border/50 hover:bg-transparent">
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={
                      header.column.id === 'rank'
                        ? 'w-12 text-right pr-4 text-xs font-medium text-muted-foreground/70 uppercase tracking-wider'
                        : header.column.id === 'player_name'
                        ? 'text-xs font-medium text-muted-foreground/70 uppercase tracking-wider'
                        : 'text-right text-xs font-medium text-muted-foreground/70 uppercase tracking-wider'
                    }
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground text-sm">
                  {globalFilter ? 'Nenhum jogador encontrado.' : 'Nenhum dado ainda. Adicione partidas no admin.'}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-border/30 hover:bg-muted/20 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={
                        cell.column.id === 'rank'
                          ? 'w-12 text-right pr-4 py-4'
                          : cell.column.id === 'player_name'
                          ? 'py-4'
                          : 'text-right py-4'
                      }
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
