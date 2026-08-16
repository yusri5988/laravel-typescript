import { Hono } from 'hono'
import type { AppEnv } from '@/app/Env'

/**
 * Web routes — equivalent to Laravel's routes/web.php.
 * Handles non-API routes (health checks, SSR pages, webhooks, etc.).
 * SPA routes are handled by the React app via the not-found fallback.
 */
const web = new Hono<AppEnv>()

web.get('/', (c) => c.json({ name: 'hono-laravel', status: 'ok' }))

web.get('/health', (c) => c.json({ status: 'ok' }))

export default web
