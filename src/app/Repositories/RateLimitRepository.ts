import type { RateLimiter, RateLimitResult } from '@/app/DurableObjects/RateLimiter'
import type { AppEnv } from '@/app/Env'

export class RateLimitRepository {
  constructor(private env: AppEnv['Bindings']) {}

  async consume(
    scope: string,
    identifier: string,
    limit: number,
    windowSeconds: number
  ): Promise<RateLimitResult> {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(identifier))
    const key = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
    const id = this.env.RATE_LIMITER.idFromName(`${scope}:${key}`)
    const limiter = this.env.RATE_LIMITER.get(id) as DurableObjectStub<RateLimiter>
    return limiter.consume(limit, windowSeconds)
  }
}
