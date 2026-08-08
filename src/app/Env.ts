/** Worker bindings and required secrets generated from wrangler.jsonc. */
export type Bindings = Env

/**
 * Request-scoped variables set by middleware (auth, db).
 */
export type Variables = {
  /** Populated by `auth` middleware after a valid JWT. */
  user?: import('@/app/Models/User').UserResource
  /** Persisted JWT session ID populated by `auth` middleware. */
  authSessionId?: string
  /** Request identifier generated or accepted by global middleware. */
  requestId?: string
}

export type AppEnv = {
  Bindings: Bindings
  Variables: Variables
}
