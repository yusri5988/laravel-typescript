import { Hono } from 'hono'
import type { AppEnv } from '@/app/Env'

/**
 * Rate limit routes — mounted at `/api/rate-limit` in `src/routes/api.ts`.
 * Placeholder until Durable Object binding is activated.
 */
const rateLimitRoutes = new Hono<AppEnv>()

rateLimitRoutes.get('/', (c) => c.json({ message: 'Rate limit status', allowed: true }))

export default rateLimitRoutes
