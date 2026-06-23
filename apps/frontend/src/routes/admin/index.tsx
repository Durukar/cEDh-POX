import { createRoute } from '@tanstack/react-router'
import { rootRoute } from '../__root'

export const adminIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => <div className="text-zinc-400">Admin area — coming soon</div>,
})
