import { createRoute, useParams, useNavigate } from '@tanstack/react-router'
import { adminIndexRoute } from './index'
import { MatchDetail } from '../../components/admin/MatchDetail'

export const adminMatchRoute = createRoute({
  getParentRoute: () => adminIndexRoute,
  path: 'matches/$matchId',
  component: MatchDetailPage,
})

function MatchDetailPage() {
  const { matchId } = useParams({ from: '/admin/matches/$matchId' })
  const navigate = useNavigate()

  function handleUnauthorized() {
    localStorage.removeItem('admin_token')
    navigate({ to: '/admin' })
  }

  return <MatchDetail matchId={Number(matchId)} onUnauthorized={handleUnauthorized} />
}
