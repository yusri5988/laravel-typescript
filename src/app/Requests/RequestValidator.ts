import { zValidator } from '@hono/zod-validator'
import type { ValidationTargets } from 'hono'
import { z } from 'zod'

function fieldErrors(error: z.ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {}

  for (const issue of error.issues) {
    const field = issue.path.length > 0 ? issue.path.join('.') : '_request'
    errors[field] ??= []
    errors[field].push(issue.message)
  }

  return errors
}

export function requestValidator<
  Target extends keyof ValidationTargets,
  Schema extends z.ZodTypeAny,
>(target: Target, schema: Schema) {
  return zValidator(target, schema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          message: 'The given data was invalid.',
          errors: fieldErrors(result.error),
        },
        422
      )
    }
  })
}
