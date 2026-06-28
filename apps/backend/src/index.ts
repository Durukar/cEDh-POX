import { Hono } from 'hono'
import { cors } from 'hono/cors'
import tournamentsRoutes from './routes/tournaments'
import playersPublicRoutes from './routes/players-public'
import adminTournamentsRoutes from './routes/admin-tournaments'
import adminRoutes from './routes/admin'
import playersRoutes from './routes/players'

export type Env = {
  DB: D1Database
  CF_ACCESS_AUD: string
  CF_ACCESS_TEAM_DOMAIN: string
  FRONTEND_ORIGIN: string
}

const app = new Hono<{ Bindings: Env }>()

app.use('*', cors({
  origin: (origin, c) => {
    const allowed = new Set([c.env.FRONTEND_ORIGIN, 'http://localhost:5173'].filter(Boolean))
    return allowed.has(origin ?? '') ? origin : null
  },
  credentials: true,
}))

// Public routes
app.route('/api/tournaments', tournamentsRoutes)
app.route('/api/players', playersPublicRoutes)

// Admin routes (more specific paths first)
app.route('/api/admin/tournaments', adminTournamentsRoutes)
app.route('/api/admin/players', playersRoutes)
app.route('/api/admin', adminRoutes)

export default app
