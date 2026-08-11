import { Hono } from 'hono'
import type { AppEnv } from '@/app/Env'
import { auth, requireRole } from '@/app/Middleware/Auth'
import { UserController } from '@/app/Controllers/UserController'

const usersRoutes = new Hono<AppEnv>()

usersRoutes.get('/me', auth, ...UserController.me)
usersRoutes.patch('/profile', auth, ...UserController.profileUpdate)
usersRoutes.delete('/profile', auth, ...UserController.profileDelete)
usersRoutes.patch('/password', auth, ...UserController.passwordUpdate)
usersRoutes.get('/', auth, requireRole('admin'), ...UserController.index)
usersRoutes.post('/', auth, requireRole('admin'), ...UserController.store)
usersRoutes.get('/:id', auth, requireRole('admin'), ...UserController.show)

export default usersRoutes
