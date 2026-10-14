import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'
import { cloudflareTest } from '@cloudflare/vitest-plugin'

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
    // The real Workers runtime is cold-started per test file; allow slower
    // first requests on local machines without masking genuine hangs.
    testTimeout: 30_000,
  },
})
