import { createRoute } from '@tanstack/react-router'
import { rootRoute } from '../__root'
import { AdminDashboard } from '../../components/admin/MatchList'

export const adminIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminDashboard,
})
