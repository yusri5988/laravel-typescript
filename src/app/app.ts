import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { AppEnv } from '@/app/Env'
import { requestId, structuredLogger } from '@/app/Middleware/Global'
import { notFound } from '@/app/Exceptions/HttpException'
import { onError } from '@/app/Exceptions/Handler'
import api from '@/routes/api'
import web from '@/routes/web'

/**
 * Application root — equivalent to Laravel's bootstrap/app.php.
 * Global middleware runs here; route modules are mounted with app.route().
 */
const app = new Hono<AppEnv>()

app.use('*', requestId)
app.use('*', structuredLogger)
app.use('/api/*', (c, next) => cors({ origin: c.env.CORS_ORIGIN ?? 'http://localhost:5173' })(c, next))

app.route('/api', api)
app.route('/', web)

app.notFound(notFound)
app.onError(onError)

export default app
