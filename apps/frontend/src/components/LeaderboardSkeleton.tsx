import { Skeleton } from './ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-8 w-56" />
      </div>
      <div className="rounded-lg border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="w-12" />
              <TableHead />
              <TableHead className="text-right" />
              <TableHead className="text-right" />
              <TableHead className="text-right" />
              <TableHead className="text-right" />
              <TableHead className="text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i} className="border-border/30 hover:bg-transparent">
                <TableCell className="w-12 text-right pr-4 py-4">
                  <Skeleton className="h-4 w-4 ml-auto" />
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right py-4">
                  <Skeleton className="h-4 w-8 ml-auto" />
                </TableCell>
                <TableCell className="text-right py-4">
                  <Skeleton className="h-4 w-5 ml-auto" />
                </TableCell>
                <TableCell className="text-right py-4">
                  <Skeleton className="h-4 w-5 ml-auto" />
                </TableCell>
                <TableCell className="text-right py-4">
                  <Skeleton className="h-4 w-5 ml-auto" />
                </TableCell>
                <TableCell className="text-right py-4">
                  <Skeleton className="h-4 w-8 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
