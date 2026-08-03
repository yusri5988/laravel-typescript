
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
