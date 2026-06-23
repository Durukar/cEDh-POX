import { rootRoute } from './routes/__root'
import { indexRoute } from './routes/index'
import { adminIndexRoute } from './routes/admin/index'
import { adminMatchRoute } from './routes/admin/matches.$matchId'
import { createRouter } from '@tanstack/react-router'

const routeTree = rootRoute.addChildren([
  indexRoute,
  adminIndexRoute.addChildren([adminMatchRoute]),
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
