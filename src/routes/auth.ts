import { Hono } from 'hono'
import type { AppEnv } from '@/app/Env'
import { AuthController } from '@/app/Controllers/AuthController'
import { auth } from '@/app/Middleware/Auth'
import { rateLimit } from '@/app/Middleware/RateLimit'

const authRoutes = new Hono<AppEnv>()

authRoutes.post('/login', rateLimit({ scope: 'auth:login', limit: 10, windowSeconds: 60 }), ...AuthController.login)
authRoutes.post('/register', rateLimit({ scope: 'auth:register', limit: 5, windowSeconds: 60 * 60 }), ...AuthController.register)
authRoutes.post('/logout', auth, ...AuthController.logout)

export default authRoutes
