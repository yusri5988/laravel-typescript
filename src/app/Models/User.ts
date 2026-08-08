
import type { UserRow } from '@/database/schema'

export type User = UserRow
export type UserRole = User['role']

/**
 * DTO — the shape of a User returned by the API.
 * Strips sensitive fields (e.g. passwordHash) at the service boundary.
 */
export type UserResource = {
  id: number
  name: string
  email: string
  role: UserRole
  createdAt: string
  emailVerifiedAt: string | null
}
