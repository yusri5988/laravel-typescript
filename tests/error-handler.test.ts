import type { Context } from 'hono'
import { describe, expect, it, vi } from 'vitest'
import type { AppEnv } from '@/app/Env'
import { onError } from '@/app/Exceptions/Handler'

describe('global error handler', () => {
  it('returns a safe 500 response with its request ID', async () => {
    const context = {
      get: () => 'request-123',
      json: (body: unknown, status: number) => Response.json(body, { status }),
    } as unknown as Context<AppEnv>
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const response = onError(new Error('database internals'), context)

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      message: 'Internal server error.',
      requestId: 'request-123',
    })
    expect(consoleError).toHaveBeenCalledOnce()
    consoleError.mockRestore()
  })
})
