import { createMiddleware } from 'hono/factory'
import type { AppEnv } from '@/app/Env'
import { rateLimitRepoFromEnv } from '@/app/Services/AppServiceProvider'

export type RateLimitPolicy = {
  scope: 'auth:login' | 'auth:register'
  limit: number
  windowSeconds: number
}

export function rateLimit(policy: RateLimitPolicy) {
  return createMiddleware<AppEnv>(async (c, next) => {
    // Cloudflare sets this header at its edge. Missing/invalid values share a
    // conservative fallback bucket rather than bypassing the limiter.
    const clientAddress = c.req.header('CF-Connecting-IP')?.trim()
    const identifier = clientAddress && clientAddress.length <= 64
      ? clientAddress
      : 'unknown-client'
    const result = await rateLimitRepoFromEnv(c.env).consume(
      policy.scope,
      identifier,
      policy.limit,
      policy.windowSeconds
    )

    c.header('RateLimit-Limit', String(policy.limit))
    c.header('RateLimit-Remaining', String(result.remaining))

    if (!result.allowed) {
      c.header('Retry-After', String(result.retryAfterSeconds))
      return c.json({ message: 'Too many requests.' }, 429)
    }

    await next()
  })
}
