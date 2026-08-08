import { createMiddleware } from 'hono/factory'
import type { AppEnv } from '@/app/Env'

/**
 * Global middleware, registered once in `src/index.ts`.
 * Order matters — they run in registration order like onion layers.
 */
export const requestId = createMiddleware<AppEnv>(async (c, next) => {
  const id = c.req.header('X-Request-Id') ?? crypto.randomUUID()
  c.set('requestId', id)
  c.header('X-Request-Id', id)
  await next()
})

export const structuredLogger = createMiddleware<AppEnv>(async (c, next) => {
  const startedAt = Date.now()
  await next()
  console.log(JSON.stringify({
    message: 'request completed',
    requestId: c.get('requestId'),
    method: c.req.method,
    path: new URL(c.req.url).pathname,
    status: c.res.status,
    durationMs: Date.now() - startedAt,
  }))
})
