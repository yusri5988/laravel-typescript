import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import type { AppEnv } from '@/app/Env'
import { requestId, structuredLogger } from '@/app/Middleware/Global'
import { notFound } from '@/app/Exceptions/HttpException'
import { onError } from '@/app/Exceptions/Handler'
import api from '@/routes/api'
import web from '@/routes/web'

/**
 * Application root — equivalent to Laravel's bootstrap/app.php.
 * Global middleware runs here; route modules are mounted with app.route().
 * Frontend static files are served for non-API routes in production.
 */
const app = new Hono<AppEnv>()

app.use('*', secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    baseUri: ["'self'"],
    connectSrc: ["'self'"],
    fontSrc: ["'self'", 'data:', 'https:'],
    formAction: ["'self'"],
    frameAncestors: ["'none'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    objectSrc: ["'none'"],
    scriptSrc: ["'self'"],
    scriptSrcAttr: ["'none'"],
    styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
  },
  permissionsPolicy: {
    camera: [],
    geolocation: [],
    microphone: [],
  },
  referrerPolicy: 'strict-origin-when-cross-origin',
  strictTransportSecurity: false,
  xContentTypeOptions: 'nosniff',
  xFrameOptions: 'DENY',
}))
app.use('*', requestId)
app.use('*', structuredLogger)
app.use('/api/*', cors({
  origin: (origin, c) => {
    if (!origin) return ''
    const allowedOrigins = new Set(
      (c.env.CORS_ORIGINS ?? '').split(',').map((value: string) => value.trim()).filter(Boolean)
    )
    return allowedOrigins.has(origin) ? origin : ''
  },
  allowHeaders: ['Authorization', 'Content-Type'],
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  maxAge: 600,
}))

// API routes
app.route('/api', api)
// Web routes
app.route('/', web)

app.notFound(notFound)
app.onError(onError)

export default app
