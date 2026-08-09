import { Hono } from 'hono'
import type { AppEnv } from '@/app/Env'
import authRoutes from '@/routes/auth'
import usersRoutes from '@/routes/users'

/**
 * API routes — mounted at `/api` in `src/app/app.ts`.
 * Sub-routers are mounted per module.
 */
const api = new Hono<AppEnv>()

api.get('/', (c) => c.json({ message: 'API v1', docs: '/api/users' }))

api.route('/auth', authRoutes)
api.route('/users', usersRoutes)

// Example: Rate limiter route (requires Durable Object binding)
// import { rateLimitRepoFromEnv } from '@/app/Services/AppServiceProvider'
// api.get('/rate/:key', async (c) => {
//   const key = c.req.param('key')
//   const repo = rateLimitRepoFromEnv(c.env)
//   const result = await repo.check(key, 10, 60)
//   return c.json({ data: result })
// })

export default api
