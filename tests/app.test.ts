import { describe, it, expect } from 'vitest'
import app from '@/app/app'
import type { AppEnv } from '@/app/Env'

/**
 * Minimal in-memory D1 mock — enough for SELECT queries.
 * For full D1 behaviour, swap in `@cloudflare/vitest-pool-workers`.
 */
function createDb(rows: Record<string, unknown>[] = []): D1Database {
  const statement = {
    bind: () => statement,
    all: async () => ({ results: rows, success: true }),
    first: async () => rows[0] ?? null,
    run: async () => ({ success: true, meta: {} }),
    raw: async () => [],
  }
  return {
    prepare: () => statement,
    batch: async () => [],
    exec: async () => ({ success: true }),
    dump: async () => new Uint8Array(),
  } as unknown as D1Database
}

const env: AppEnv['Bindings'] = {
  DB: createDb(),
  JWT_SECRET: 'test-secret',
  APP_NAME: 'hono-laravel',
  CORS_ORIGIN: '*',
  ASSETS: {
    fetch: async () => new Response('<div id="root"></div>', { status: 200 }),
  } as unknown as Fetcher,
}

describe('web routes', () => {
  it('GET / returns service info', async () => {
    const res = await app.request('http://localhost/', {}, env)
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({ name: 'hono-laravel', status: 'ok' })
  })

  it('GET /health returns ok', async () => {
    const res = await app.request('http://localhost/health', {}, env)
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ status: 'ok' })
  })

  it('returns the SPA shell for unknown non-API routes', async () => {
    const res = await app.request('http://localhost/login', {}, env)
    expect(res.status).toBe(200)
    expect(await res.text()).toContain('<div id="root"></div>')
  })

  it('returns 404 JSON for unknown API routes', async () => {
    const res = await app.request('http://localhost/api/unknown', {}, env)
    expect(res.status).toBe(404)
    await expect(res.json()).resolves.toEqual({ message: 'Not Found' })
  })
})

describe('api routes', () => {
  it('protects the user collection from unauthenticated access', async () => {
    const res = await app.request('http://localhost/api/users', {}, env)
    expect(res.status).toBe(401)
    await expect(res.json()).resolves.toEqual({ message: 'Unauthenticated.' })
  })

  it('GET /api/users/me requires auth', async () => {
    const res = await app.request('http://localhost/api/users/me', {}, env)
    expect(res.status).toBe(401)
  })

  it('returns the standard 422 validation response', async () => {
    const res = await app.request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', email: 'invalid', password: 'short' }),
    }, env)

    expect(res.status).toBe(422)
    await expect(res.json()).resolves.toMatchObject({
      message: 'The given data was invalid.',
      errors: {
        name: expect.any(Array),
        email: expect.any(Array),
        password: expect.any(Array),
      },
    })
  })
})
