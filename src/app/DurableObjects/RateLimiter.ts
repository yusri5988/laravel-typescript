/**
 * Rate Limiter Durable Object
 * 
 * This is a template example of a Durable Object for rate limiting.
 * Uncomment the binding in wrangler.jsonc to activate.
 */

export interface RateLimiterEnv {
  // Add bindings here if needed
}

export class RateLimiter {
  private state: DurableObjectState
  private env: RateLimiterEnv

  constructor(state: DurableObjectState, env: RateLimiterEnv) {
    this.state = state
    this.env = env
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname

    try {
      if (path.startsWith('/rate/')) {
        const key = path.replace('/rate/', '')
        const limit = parseInt(url.searchParams.get('limit') || '10')
        const windowSeconds = parseInt(url.searchParams.get('window') || '60')
        
        const result = await this.increment(key, limit, windowSeconds)
        return Response.json(result)
      }
      
      if (path === '/rate/increment') {
        const key = url.searchParams.get('key') || ''
        if (key) {
          await this.increment(key, 10, 60)
          return new Response('OK')
        }
        return new Response('Missing key', { status: 400 })
      }
      
      if (path === '/rate/count') {
        const key = url.searchParams.get('key') || ''
        if (key) {
          const count = await this.getCount(key)
          return Response.json({ key, count })
        }
        return new Response('Missing key', { status: 400 })
      }
      
      if (path === '/rate/delete') {
        const key = url.searchParams.get('key') || ''
        if (key) {
          await this.deleteKey(key)
          return new Response('OK')
        }
        return new Response('Missing key', { status: 400 })
      }
      
      if (path === '/rate/list') {
        const keys = await this.listKeys()
        return Response.json({ keys })
      }
      
      return new Response('Not found', { status: 404 })
    } catch (error) {
      console.error('RateLimiter error:', error)
      return new Response('Internal error', { status: 500 })
    }
  }

  /**
   * Increment request count for a given key within a time window
   */
  async increment(key: string, limit: number, windowSeconds: number): Promise<{ current: number; limit: number; remaining: number }> {
    const now = Date.now()
    const windowMs = windowSeconds * 1000
    
    let data = await this.state.storage.get<string>(key)
    
    if (!data) {
      data = JSON.stringify({ count: 1, resetAt: now + windowMs })
      await this.state.storage.put(key, data)
      return { current: 1, limit, remaining: limit - 1 }
    }
    
    const parsed = JSON.parse(data) as { count: number; resetAt: number }
    
    if (now > parsed.resetAt) {
      parsed.count = 1
      parsed.resetAt = now + windowMs
    } else {
      parsed.count++
    }
    
    await this.state.storage.put(key, JSON.stringify(parsed))
    
    const current = parsed.count
    const remaining = Math.max(0, limit - current)
    
    return { current, limit, remaining }
  }

  /**
   * Get current count for a key
   */
  async getCount(key: string): Promise<number> {
    const data = await this.state.storage.get<string>(key)
    if (!data) return 0
    const parsed = JSON.parse(data) as { count: number; resetAt: number }
    return parsed.count
  }

  /**
   * Delete a key
   */
  async deleteKey(key: string): Promise<void> {
    await this.state.storage.delete(key)
  }

  /**
   * List all keys
   */
  async listKeys(): Promise<string[]> {
    const list = await this.state.storage.list()
    return Array.from(list.keys()).map(k => k)
  }
}
