import { Hono } from 'hono'
import type { AppEnv } from '@/app/Env'
import { UserController } from '@/app/Controllers/UserController'

const authRoutes = new Hono<AppEnv>()

authRoutes.post('/login', ...UserController.login)

export default authRoutes
