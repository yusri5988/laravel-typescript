import { HTTPException } from 'hono/http-exception'
import type { Context } from 'hono'

/**
 * Global error handler — Laravel's Exception Handler.
 * Registered in `src/app/app.ts` via `app.onError()`.
 *
 * - ValidationException / HTTPException -> its own status + JSON body
 * - everything else -> 500 with a sanitized message
 */
export function onError(err: Error, c: Context): Response {
  if (err instanceof HTTPException) {
    return err.getResponse()
  }

  console.error(err)
  return c.json(
    {
      message: 'Internal Server Error',
    },
    500
  )
}
