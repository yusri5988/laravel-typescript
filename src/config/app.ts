/**
 * App configuration — equivalent to Laravel's config/app.php.
 * Sensitive values (like JWT_SECRET) come from Cloudflare secrets, not here.
 */
export const appConfig = {
  name: 'hono-laravel',
  env: 'production',
  url: 'http://localhost:8787',
} as const

export const authConfig = {
  jwtTtlSeconds: 60 * 60 * 24, // 24h
  secretKey: 'JWT_SECRET',
} as const

export const databaseConfig = {
  /** D1 binding name defined in wrangler.jsonc. */
  binding: 'DB',
} as const
