/**
 * Rate Limit Repository
 * 
 * Wraps Durable Object calls for rate limiting.
 * This is a template showing how to interact with Durable Objects.
 */

import type { AppEnv } from '@/app/Env'

export class RateLimitRepository {
  private env: AppEnv['Bindings']

  constructor(env: AppEnv['Bindings']) {
    this.env = env
  }

  /**
   * Check if a key has exceeded the rate limit
   */
  async check(key: string, limit: number, windowSeconds: number): Promise<{ allowed: boolean; current: number; remaining: number }> {
    // When RATE_LIMITER binding is configured:
    // const doStub = this.env.RATE_LIMITER.get(this.env.RATE_LIMITER.idFromName(key))
    // const response = await doStub.fetch(`/rate/${key}?limit=${limit}&window=${windowSeconds}`)
    // const result = await response.json() as { current: number; limit: number; remaining: number }
    // return { allowed: result.current <= result.limit, ...result }
    
    // Placeholder - returns always allowed until binding is configured
    return { allowed: true, current: 0, remaining: limit }
  }

  /**
   * Increment counter for a key
   */
  async increment(key: string): Promise<void> {
    // When RATE_LIMITER binding is configured:
    // const doStub = this.env.RATE_LIMITER.get(this.env.RATE_LIMITER.idFromName(key))
    // await doStub.fetch(`/rate/increment/${key}`, { method: 'POST' })
  }
}
