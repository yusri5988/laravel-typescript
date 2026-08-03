import { createMiddleware } from 'hono/factory'
import { sign, verify } from 'hono/jwt'
import type { Context } from 'hono'
import type { AppEnv } from '@/app/Env'
import type { UserResource } from '@/app/Models/User'
import { authConfig } from '@/config/app'

/**
 * Issue a JWT for a user (login).
 * Call from a handler: `const token = await issueToken(c, userResource)`.
 */
export async function issueToken(c: Context<AppEnv>, user: UserResource): Promise<string> {
  const secret = c.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not configured.')
  }
  const payload = {
    sub: String(user.id),
    name: user.name,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + authConfig.jwtTtlSeconds,
  }
  return sign(payload, secret, 'HS256')
}

/**
 * Auth middleware — verifies `Authorization: Bearer <jwt>`.
 * Usage: `app.use('/api/protected/*', auth)`
 * On success, the handler reads `c.get('user')`.
 */
export const auth = createMiddleware<AppEnv>(async (c, next) => {
  const header = c.req.header('Authorization')
  if (!header?.startsWith('Bearer ')) {
    return c.json({ message: 'Unauthenticated.' }, 401)
  }

  try {
    const secret = c.env.JWT_SECRET
    if (!secret) {
      throw new Error('JWT_SECRET is not configured.')
    }
    const payload = await verify(header.slice(7), secret, 'HS256')

    const user: UserResource = {
      id: Number(payload.sub),
      name: String(payload.name ?? ''),
      email: String(payload.email ?? ''),
      createdAt: new Date(0),
      emailVerifiedAt: null,
    }
    c.set('user', user)
    await next()
  } catch {
    return c.json({ message: 'Invalid token.' }, 401)
  }
})
