import { exports, env } from 'cloudflare:workers'
import { beforeAll, describe, expect, it } from 'vitest'

const passwordHash = 'pbkdf2$120000$ZGVtby1zYWx0LTE2$mQbiV_eW3dNqYlkuF-SaN6KC1nymWA3tUzZh64DMTyc'

beforeAll(async () => {
  await env.DB.prepare(
    "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'user', email_verified_at INTEGER, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)"
  ).run()
  await env.DB.prepare(
    'CREATE TABLE IF NOT EXISTS auth_sessions (id TEXT PRIMARY KEY NOT NULL, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at INTEGER NOT NULL, revoked_at INTEGER, created_at INTEGER NOT NULL)'
  ).run()
  await env.DB.prepare('DELETE FROM auth_sessions').run()
  await env.DB.prepare('DELETE FROM users').run()
  await env.DB.prepare(
    "INSERT INTO users (name, email, password_hash, role, created_at, updated_at) VALUES ('Admin User', 'admin@example.com', ?, 'admin', unixepoch(), unixepoch()), ('Normal User', 'user@example.com', ?, 'user', unixepoch(), unixepoch())"
  ).bind(passwordHash, passwordHash).run()
})

async function login(email: string): Promise<string> {
  const response = await exports.default.fetch('http://worker.test/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password123' }),
  })

  expect(response.status).toBe(200)
  const body = await response.json<{ token: string }>()
  return body.token
}

function bearer(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` }
}

describe.sequential('Worker integration', () => {
  it('denies user management to unauthenticated requests', async () => {
    const response = await exports.default.fetch('http://worker.test/api/users')

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ message: 'Unauthenticated.' })
  })

  it('denies user management to authenticated non-admin users', async () => {
    const token = await login('user@example.com')
    const response = await exports.default.fetch('http://worker.test/api/users', {
      headers: bearer(token),
    })

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({ message: 'Forbidden.' })
  })

  it('returns a paginated user list to admins', async () => {
    const token = await login('admin@example.com')
    const response = await exports.default.fetch('http://worker.test/api/users?page=1&perPage=1', {
      headers: bearer(token),
    })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      data: [{ email: 'admin@example.com', role: 'admin' }],
      meta: { page: 1, perPage: 1, total: 2 },
    })
  })

  it('keeps registration public and assigns the safe default role', async () => {
    const response = await exports.default.fetch('http://worker.test/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Registered User',
        email: 'registered@example.com',
        password: 'password123',
      }),
    })

    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toMatchObject({
      data: { email: 'registered@example.com', role: 'user' },
    })
  })

  it('returns JSON for scoped not-found errors', async () => {
    const token = await login('admin@example.com')
    const response = await exports.default.fetch('http://worker.test/api/users/9999', {
      headers: bearer(token),
    })

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({ message: 'User not found.' })
  })

  it('revokes the current persisted session on logout', async () => {
    const token = await login('user@example.com')
    const logout = await exports.default.fetch('http://worker.test/api/auth/logout', {
      method: 'POST',
      headers: bearer(token),
    })
    expect(logout.status).toBe(200)

    const afterLogout = await exports.default.fetch('http://worker.test/api/users/me', {
      headers: bearer(token),
    })
    expect(afterLogout.status).toBe(401)
  })

  it('revokes every session after a password change', async () => {
    const firstToken = await login('user@example.com')
    const secondToken = await login('user@example.com')

    const update = await exports.default.fetch('http://worker.test/api/users/password', {
      method: 'PATCH',
      headers: {
        ...bearer(firstToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentPassword: 'password123',
        password: 'new-password123',
        passwordConfirmation: 'new-password123',
      }),
    })
    expect(update.status).toBe(200)

    for (const token of [firstToken, secondToken]) {
      const response = await exports.default.fetch('http://worker.test/api/users/me', {
        headers: bearer(token),
      })
      expect(response.status).toBe(401)
    }
  })
})
