import type { Context } from 'hono'
import type { AppEnv } from '@/app/Env'

/**
 * Route-not-found handler.
 * Equivalent to Laravel's 404 page.
 * Non-API GET requests fall back to the SPA shell so React can handle the route.
 */
export async function notFound(c: Context<AppEnv>): Promise<Response> {
  const isApi = c.req.path.startsWith('/api/')
  const wantsJson = c.req.header('accept')?.includes('application/json')

  if (!isApi && !wantsJson) {
    return c.env.ASSETS.fetch(new URL('/index.html', c.req.url))
  }

  return c.json({ message: 'Not Found' }, 404)
}
