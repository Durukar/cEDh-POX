import { createRoute, useParams } from '@tanstack/react-router'
import { adminIndexRoute } from './index'
import { MatchDetail } from '../../components/admin/MatchDetail'

export const adminMatchRoute = createRoute({
  getParentRoute: () => adminIndexRoute,
  path: 'matches/$matchId',
  component: MatchDetailPage,
})

function MatchDetailPage() {
  const { matchId } = useParams({ from: '/admin/matches/$matchId' })
  return <MatchDetail matchId={Number(matchId)} />
}
