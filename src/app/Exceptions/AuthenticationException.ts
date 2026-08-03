import { HTTPException } from 'hono/http-exception'

export class AuthenticationException extends HTTPException {
  constructor(message = 'Invalid credentials.') {
    super(401, { message })
  }
}
