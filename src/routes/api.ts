import { Hono } from 'hono'
import type { AppEnv } from '@/app/Models/User'
import { auth } from '@/app/Middleware/Auth'
import { UserController } from '@/app/Controllers/UserController'

/**
 * API routes — mounted at `/api` in `src/app/app.ts`.
 * Use `app.route('/users', users)` to split by resource like Laravel's
 * `Route::apiResource()`.
 */
const api = new Hono<AppEnv>()

api.get('/', (c) => c.json({ message: 'API v1', docs: '/api/users' }))

api.post('/auth/login', ...UserController.login)

// Auth-protected demo: GET /api/users/me
api.get('/users/me', auth, ...UserController.me)

api.get('/users', ...UserController.index)
api.post('/users', ...UserController.store)
api.get('/users/:id', ...UserController.show)

export default api
