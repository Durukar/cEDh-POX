import { createRoute, useParams } from '@tanstack/react-router'
import { rootRoute } from '../__root'
import { MatchDetail } from '../../components/admin/MatchDetail'

export const adminMatchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/matches/$matchId',
  component: MatchDetailPage,
})

function MatchDetailPage() {
  const { matchId } = useParams({ from: '/admin/matches/$matchId' })
  return <MatchDetail matchId={Number(matchId)} />
}
