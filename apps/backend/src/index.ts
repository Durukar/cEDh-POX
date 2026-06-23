import { Hono } from 'hono'
import { cors } from 'hono/cors'
import leaderboardRoutes from './routes/leaderboard'
import matchesRoutes from './routes/matches'
import adminRoutes from './routes/admin'

export type Env = {
  DB: D1Database
  ADMIN_TOKEN: string
}

const app = new Hono<{ Bindings: Env }>()

app.use('*', cors())

app.route('/api/leaderboard', leaderboardRoutes)
app.route('/api/matches', matchesRoutes)
app.route('/api/admin', adminRoutes)

export default app
