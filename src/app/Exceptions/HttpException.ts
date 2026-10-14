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
    const assetResponse = await c.env.ASSETS.fetch(new URL('/index.html', c.req.url))
    // Wrangler's asset responses may have immutable headers. Clone into a new
    // Response so outer security-header middleware can safely decorate it.
    return new Response(assetResponse.body, assetResponse)
  }

  return c.json({ message: 'Not Found' }, 404)
}
