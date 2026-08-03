import { createFactory } from 'hono/factory'
import { drizzle } from 'drizzle-orm/d1'
import * as schema from '@/database/schema'
import type { AppEnv } from '@/app/Env'
import { UserRepository } from '@/app/Repositories/UserRepository'
import { UserService } from '@/app/Services/UserService'

/**
 * Hono factory typed with our env — used across the app layer so
 * handlers keep full type inference for `c.env` and `c.var`.
 */
export const factory = createFactory<AppEnv>()

/**
 * Build a Drizzle instance bound to the request's D1 connection.
 * Called per-request (no long-lived singletons — serverless friendly).
 */
export function dbFrom(env: AppEnv['Bindings']) {
  return drizzle(env.DB, { schema })
}

/**
 * Helper to resolve UserService per-request without repeated instantiation boilerplates.
 */
export function userServiceFrom(env: AppEnv['Bindings']) {
  return new UserService(new UserRepository(dbFrom(env)))
}
