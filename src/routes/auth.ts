import { Hono } from 'hono'
import type { AppEnv } from '@/app/Env'
import { AuthController } from '@/app/Controllers/AuthController'
import { auth } from '@/app/Middleware/Auth'

const authRoutes = new Hono<AppEnv>()

authRoutes.post('/login', ...AuthController.login)
authRoutes.post('/register', ...AuthController.register)
authRoutes.post('/logout', auth, ...AuthController.logout)

export default authRoutes
