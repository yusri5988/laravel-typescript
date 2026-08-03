import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'
import { cloudflareTest } from '@cloudflare/vitest-pool-workers'

export default defineConfig({
  plugins: [
      cloudflareTest({
        wrangler: { configPath: './wrangler.jsonc' },
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
