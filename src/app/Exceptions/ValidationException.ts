import { HTTPException } from 'hono/http-exception'

/**
 * Thrown by Services when business rules reject the request.
 * Shape mirrors Laravel's 422 validation error response:
 * `{ message, errors: { field: [messages] } }`.
 */
export class ValidationException extends HTTPException {
  constructor(
    public errors: Record<string, string[]>,
    message = 'The given data was invalid.'
  ) {
    super(422, { message })
  }

  getResponse(): Response {
    return Response.json(
      {
        message: this.message,
        errors: this.errors,
      },
      { status: this.status }
    )
  }
}
