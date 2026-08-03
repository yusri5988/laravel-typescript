import { Hono } from 'hono'
import type { AppEnv } from '@/app/Env'
import { auth } from '@/app/Middleware/Auth'
import { UserController } from '@/app/Controllers/UserController'

const usersRoutes = new Hono<AppEnv>()

usersRoutes.get('/me', auth, ...UserController.me)
usersRoutes.patch('/profile', auth, ...UserController.profileUpdate)
usersRoutes.patch('/password', auth, ...UserController.passwordUpdate)
usersRoutes.get('/', ...UserController.index)
usersRoutes.post('/', ...UserController.store)
usersRoutes.get('/:id', ...UserController.show)

export default usersRoutes
