import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

/**
 * Requests — Zod schemas mirroring Laravel Form Requests.
 * They validate the request body *before* the controller runs,
 * so `c.req.valid('json')` is fully typed inside handlers.
 */

export const storeUserRequest = zValidator(
  'json',
  z.object({
    name: z.string().min(1, 'Name is required.'),
    email: z.string().email('A valid email is required.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
  })
)

export const showUserRequest = zValidator(
  'param',
  z.object({
    id: z.coerce.number().int().positive(),
  })
)

export const loginUserRequest = zValidator(
  'json',
  z.object({
    email: z.string().email(),
    password: z.string().min(1),
  })
)

export const updateProfileRequest = zValidator('json', z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
}).refine((value) => value.name !== undefined || value.email !== undefined, {
  message: 'At least one profile field is required.',
}))

export const updatePasswordRequest = zValidator('json', z.object({
  currentPassword: z.string().min(1),
  password: z.string().min(8),
  passwordConfirmation: z.string().min(8),
}).refine((value) => value.password === value.passwordConfirmation, {
  path: ['passwordConfirmation'],
  message: 'The password confirmation does not match.',
}))
