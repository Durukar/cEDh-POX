import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { LeaderboardTable } from '../components/LeaderboardTable'

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LeaderboardPage,
})

function LeaderboardPage() {
  return <LeaderboardTable />
}
