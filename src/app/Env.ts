/**
 * Worker bindings — D1 database + vars, defined in wrangler.jsonc.
 */
/**
 * `Env` is generated from wrangler.jsonc by `wrangler types`.
 * JWT_SECRET is a Wrangler secret, so it is added as a required runtime value.
 */
export type Bindings = Env & {
  JWT_SECRET: string
}

/**
 * Request-scoped variables set by middleware (auth, db).
 */
export type Variables = {
  /** Populated by `auth` middleware after a valid JWT. */
  user?: import('@/app/Models/User').UserResource
}

export type AppEnv = {
  Bindings: Bindings
  Variables: Variables
}
