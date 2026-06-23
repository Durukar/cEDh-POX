import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { LeaderboardEntry } from '@cedh-pox/shared'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { LeaderboardSkeleton } from './LeaderboardSkeleton'

const columnHelper = createColumnHelper<LeaderboardEntry>()

const columns = [
  columnHelper.accessor('rank', {
    header: '#',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('player_name', {
    header: 'Player',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('commanders', {
    header: 'Commander(s)',
    cell: (info) => {
      const cmds = info.getValue()
      return cmds.length > 0 ? cmds.join(', ') : '—'
    },
  }),
  columnHelper.accessor('total_points', {
    header: 'Points',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('wins', {
    header: 'W',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('draws', {
    header: 'D',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('losses', {
    header: 'L',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('matches_played', {
    header: 'Matches',
    cell: (info) => info.getValue(),
  }),
]

export function LeaderboardTable() {
  const { data, isLoading, isError } = useLeaderboard()

  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isLoading) {
    return <LeaderboardSkeleton />
  }

  if (isError) {
    return (
      <div className="text-center py-12 text-zinc-500">
        Failed to load leaderboard data.
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        No players yet. Add match data in the admin area.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={
                    header.column.id === 'rank'
                      ? 'text-xs uppercase tracking-wider text-zinc-500 w-10 text-center pb-3 pr-4'
                      : 'text-xs uppercase tracking-wider text-zinc-500 text-left pb-3 pr-4'
                  }
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-t border-zinc-800 text-sm hover:bg-zinc-900 transition-colors">
              {row.getVisibleCells().map((cell) => {
                const colId = cell.column.id
                let className = 'py-3 pr-4'
                if (colId === 'rank') {
                  className = 'py-3 pr-4 text-zinc-500 w-10 text-center'
                } else if (colId === 'total_points') {
                  className = 'py-3 pr-4 font-bold text-white'
                } else if (colId === 'commanders') {
                  className = 'py-3 pr-4 text-zinc-400 text-xs'
                }
                return (
                  <td key={cell.id} className={className}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
