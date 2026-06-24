import { rootRoute } from './routes/__root'
import { indexRoute } from './routes/index'
import { tournamentsIndexRoute } from './routes/tournaments.index'
import { tournamentDetailRoute } from './routes/tournaments.$tournamentId'
import { playerProfileRoute } from './routes/players.$playerId'
import { adminIndexRoute } from './routes/admin/index'
import { adminMatchRoute } from './routes/admin/matches.$matchId'
import { adminPlayersRoute } from './routes/admin/players'
import { adminTournamentsRoute } from './routes/admin/tournaments'
import { adminTournamentDetailRoute } from './routes/admin/tournaments.$tournamentId'
import { createRouter } from '@tanstack/react-router'

const routeTree = rootRoute.addChildren([
  indexRoute,
  tournamentsIndexRoute,
  tournamentDetailRoute,
  playerProfileRoute,
  adminIndexRoute,
  adminMatchRoute,
  adminPlayersRoute,
  adminTournamentsRoute,
  adminTournamentDetailRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
