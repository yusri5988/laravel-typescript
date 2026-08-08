import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'
import { cloudflareTest } from '@cloudflare/vitest-pool-workers'

process.env.JWT_SECRET ??= 'test-only-jwt-secret'

export default defineConfig({
  plugins: [
      cloudflareTest({
        wrangler: { configPath: './wrangler.jsonc' },
        miniflare: {
          bindings: {
            JWT_SECRET: 'test-only-jwt-secret',
          },
        },
      }),
  ],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src'),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
