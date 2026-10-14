import { DurableObject } from 'cloudflare:workers'

export type RateLimitResult = {
  allowed: boolean
  current: number
  remaining: number
  retryAfterSeconds: number
}

/** A single fixed-window counter. The Worker chooses the DO identity. */
export class RateLimiter extends DurableObject {
  constructor(ctx: DurableObjectState, env: Cloudflare.Env) {
    super(ctx, env)
    this.ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS rate_limit_counter (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        window_start INTEGER NOT NULL,
        count INTEGER NOT NULL
      )
    `)
  }

  consume(limit: number, windowSeconds: number): RateLimitResult {
    if (!Number.isSafeInteger(limit) || limit < 1) {
      throw new RangeError('Rate limit must be a positive integer.')
    }
    if (!Number.isSafeInteger(windowSeconds) || windowSeconds < 1) {
      throw new RangeError('Rate-limit window must be a positive integer.')
    }

    const now = Date.now()
    const windowMs = windowSeconds * 1000
    const windowStart = Math.floor(now / windowMs) * windowMs
    const existing = this.ctx.storage.sql
      .exec<{ window_start: number; count: number }>(
        'SELECT window_start, count FROM rate_limit_counter WHERE id = 1'
      )
      .toArray()[0]

    const current = existing?.window_start === windowStart
      ? Math.min(limit + 1, existing.count + 1)
      : 1

    this.ctx.storage.sql.exec(
      `INSERT INTO rate_limit_counter (id, window_start, count)
       VALUES (1, ?, ?)
       ON CONFLICT(id) DO UPDATE SET window_start = excluded.window_start, count = excluded.count`,
      windowStart,
      current
    )

    return {
      allowed: current <= limit,
      current,
      remaining: Math.max(0, limit - current),
      retryAfterSeconds: Math.max(1, Math.ceil((windowStart + windowMs - now) / 1000)),
    }
  }
}
