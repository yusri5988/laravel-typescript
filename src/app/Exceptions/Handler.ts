import { HTTPException } from 'hono/http-exception'
import type { Context } from 'hono'
import { ValidationException } from '@/app/Exceptions/ValidationException'
import type { AppEnv } from '@/app/Env'

/**
 * Global error handler — Laravel's Exception Handler.
 * Registered in `src/app/app.ts` via `app.onError()`.
 *
 * - ValidationException / HTTPException -> its own status + JSON body
 * - everything else -> 500 with a sanitized message
 */
export function onError(err: Error, c: Context<AppEnv>): Response {
  if (err instanceof HTTPException) {
    if (err instanceof ValidationException) {
      return err.getResponse()
    }
    return c.json({ message: err.message }, err.status)
  }

  console.error(JSON.stringify({
    message: 'Unhandled application error',
    error: err.message,
    requestId: c.get('requestId'),
  }))
  return c.json(
    {
      message: 'Internal Server Error',
    },
    500
  )
}
