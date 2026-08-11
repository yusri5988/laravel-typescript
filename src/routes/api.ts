import { Hono } from 'hono'
import type { AppEnv } from '@/app/Env'
import authRoutes from '@/routes/auth'
import usersRoutes from '@/routes/users'
import rateLimitRoutes from '@/routes/rate-limit'

/**
 * API routes — mounted at `/api` in `src/app/app.ts`.
 * Sub-routers are mounted per module.
 */
const api = new Hono<AppEnv>()

api.get('/', (c) => c.json({ message: 'API v1', docs: '/api/users' }))

api.route('/auth', authRoutes)
api.route('/users', usersRoutes)
api.route('/rate-limit', rateLimitRoutes)

export default api
