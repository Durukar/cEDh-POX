import { createMiddleware } from 'hono/factory'
import type { Env } from '../index'

export const adminAuth = createMiddleware<{ Bindings: Env }>(async (c, next) => {
  const token = c.req.header('X-Admin-Token')
  if (!token || token !== c.env.ADMIN_TOKEN) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  await next()
})
