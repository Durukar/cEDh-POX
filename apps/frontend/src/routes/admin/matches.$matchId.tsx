import { createRoute } from '@tanstack/react-router'
import { adminIndexRoute } from './index'

export const adminMatchRoute = createRoute({
  getParentRoute: () => adminIndexRoute,
  path: 'matches/$matchId',
  component: () => <div>Match detail</div>,
})
