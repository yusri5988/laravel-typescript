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
  user?: UserResource
}

export type AppEnv = {
  Bindings: Bindings
  Variables: Variables
}

/**
 * Model types — the shape of rows flowing through the app.
 * Unlike Eloquent, these are plain TypeScript types; the query layer
 * lives in Repositories.
 */
export type User = {
  id: number
  name: string
  email: string
  /** Raw `password_hash` column; never expose in API responses. */
  passwordHash: string
  createdAt: Date
  updatedAt: Date
}

/**
 * DTO — the shape of a User returned by the API.
 * Strips sensitive fields (e.g. passwordHash) at the service boundary.
 */
export type UserResource = {
  id: number
  name: string
  email: string
  createdAt: Date
}
