import { HTTPException } from 'hono/http-exception'

export class AuthorizationException extends HTTPException {
  constructor(message = 'Forbidden.') {
    super(403, { message })
  }
}
