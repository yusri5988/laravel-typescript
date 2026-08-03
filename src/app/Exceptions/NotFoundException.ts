import { HTTPException } from 'hono/http-exception'

/**
 * Thrown by Services when a resource is not found.
 * Caught by the global error handler in `src/index.ts`.
 */
export class NotFoundException extends HTTPException {
  constructor(resource = 'Resource') {
    super(404, {
      message: `${resource} not found.`,
    })
  }
}
