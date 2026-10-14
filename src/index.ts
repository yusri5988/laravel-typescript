import app from '@/app/app'
export { RateLimiter } from '@/app/DurableObjects/RateLimiter'

/**
 * Worker entrypoint — Cloudflare Workers default export.
 * `app` is built in `src/app/app.ts` (Laravel bootstrap equivalent).
 */
export default app
