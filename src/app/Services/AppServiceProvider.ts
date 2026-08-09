import { createFactory } from 'hono/factory'
import { drizzle } from 'drizzle-orm/d1'
import * as schema from '@/database/schema'
import type { AppEnv } from '@/app/Env'
import { UserRepository } from '@/app/Repositories/UserRepository'
import { AuthRepository } from '@/app/Repositories/AuthRepository'
import { RateLimitRepository } from '@/app/Repositories/RateLimitRepository'
import { AuthService } from '@/app/Services/AuthService'
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

export function authServiceFrom(env: AppEnv['Bindings']) {
  const db = dbFrom(env)
  return new AuthService(
    new UserService(new UserRepository(db)),
    new AuthRepository(db),
    env.JWT_SECRET
  )
}

/**
 * Helper to resolve RateLimitRepository per-request.
 * Requires Durable Object binding configured in wrangler.jsonc.
 */
export function rateLimitRepoFromEnv(env: AppEnv['Bindings']) {
  // When RATE_LIMITER binding is configured:
  // const doStub = env.RATE_LIMITER.get(env.RATE_LIMITER.idFromName('default'))
  // return new RateLimitRepository(doStub)
  
  // Placeholder - returns empty repo until binding is available
  return new RateLimitRepository(env as any)
}
