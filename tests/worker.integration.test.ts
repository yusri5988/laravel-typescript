import { exports, env } from 'cloudflare:workers'
import { beforeAll, describe, expect, it } from 'vitest'

beforeAll(async () => {
  await env.DB.prepare(
    'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, email_verified_at INTEGER, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)'
  ).run()
})

describe('Worker integration', () => {
  it('reads from the real D1 binding through the application route', async () => {
    const response = await exports.default.fetch('http://worker.test/api/users')

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({ data: [] })
  })

  it('creates a user through the real Worker runtime and D1 binding', async () => {
    const response = await exports.default.fetch('http://worker.test/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Integration User',
        email: 'integration@example.com',
        password: 'password123',
      }),
    })

    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toMatchObject({
      data: { email: 'integration@example.com' },
    })
  })
})
