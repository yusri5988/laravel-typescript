import { HTTPException } from 'hono/http-exception'

/**
 * Route-not-found handler.
 * Equivalent to Laravel's 404 page — but JSON.
 */
export function notFound(c: { json: (body: unknown, status?: number) => Response }) {
  return c.json({ message: 'Not Found' }, 404)
}
