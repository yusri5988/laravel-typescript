import { Hono } from 'hono'
import type { AppEnv } from '@/app/Env'
import { UserController } from '@/app/Controllers/UserController'
import { auth } from '@/app/Middleware/Auth'

const authRoutes = new Hono<AppEnv>()

authRoutes.post('/login', ...UserController.login)
authRoutes.post('/register', ...UserController.register)
authRoutes.post('/logout', auth, ...UserController.logout)

export default authRoutes
