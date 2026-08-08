import { createMiddleware } from 'hono/factory'
import type { AppEnv } from '@/app/Env'
import { AuthenticationException } from '@/app/Exceptions/AuthenticationException'
import { AuthorizationException } from '@/app/Exceptions/AuthorizationException'
import { authServiceFrom } from '@/app/Services/AppServiceProvider'

export const auth = createMiddleware<AppEnv>(async (c, next) => {
  const header = c.req.header('Authorization')
  if (!header?.startsWith('Bearer ')) {
    return c.json({ message: 'Unauthenticated.' }, 401)
  }

  try {
    const identity = await authServiceFrom(c.env).authenticateToken(header.slice(7))
    c.set('user', identity.user)
    c.set('authSessionId', identity.sessionId)
    await next()
  } catch (error) {
    if (error instanceof AuthenticationException) {
      return c.json({ message: error.message }, 401)
    }
    throw error
  }
})

export function requireRole(...roles: Array<'admin' | 'user'>) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const user = c.get('user')
    if (!user) return c.json({ message: 'Unauthenticated.' }, 401)
    if (!roles.includes(user.role)) throw new AuthorizationException()
    await next()
  })
}
