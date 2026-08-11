import { and, eq, gt, isNull } from 'drizzle-orm'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import * as schema from '@/database/schema'
import { authSessions, users } from '@/database/schema'
import type { AuthSessionRow, NewAuthSessionRow } from '@/database/schema'

type Db = DrizzleD1Database<typeof schema>

export interface AuthRepositoryContract {
  createSession(data: NewAuthSessionRow): Promise<AuthSessionRow>
  findActiveSession(id: string, userId: number, now: Date): Promise<AuthSessionRow | undefined>
  revokeSession(id: string, userId: number, revokedAt: Date): Promise<void>
  revokeAllSessions(userId: number, revokedAt: Date): Promise<void>
  updatePasswordAndRevokeSessions(
    userId: number,
    passwordHash: string,
    changedAt: Date
  ): Promise<boolean>
  deleteUserAndRevokeSessions(userId: number): Promise<boolean>
}

export class AuthRepository implements AuthRepositoryContract {
  constructor(private db: Db) {}

  async createSession(data: NewAuthSessionRow): Promise<AuthSessionRow> {
    const [row] = await this.db.insert(authSessions).values(data).returning()
    if (!row) throw new Error('Auth session insert returned no row.')
    return row
  }

  async findActiveSession(id: string, userId: number, now: Date): Promise<AuthSessionRow | undefined> {
    const rows = await this.db
      .select()
      .from(authSessions)
      .where(
        and(
          eq(authSessions.id, id),
          eq(authSessions.userId, userId),
          isNull(authSessions.revokedAt),
          gt(authSessions.expiresAt, now)
        )
      )
      .limit(1)
    return rows[0]
  }

  async revokeSession(id: string, userId: number, revokedAt: Date): Promise<void> {
    await this.db
      .update(authSessions)
      .set({ revokedAt })
      .where(and(eq(authSessions.id, id), eq(authSessions.userId, userId)))
  }

  async revokeAllSessions(userId: number, revokedAt: Date): Promise<void> {
    await this.db
      .update(authSessions)
      .set({ revokedAt })
      .where(and(eq(authSessions.userId, userId), isNull(authSessions.revokedAt)))
  }

  async updatePasswordAndRevokeSessions(
    userId: number,
    passwordHash: string,
    changedAt: Date
  ): Promise<boolean> {
    const [updatedUsers] = await this.db.batch([
      this.db
        .update(users)
        .set({ passwordHash, updatedAt: changedAt })
        .where(eq(users.id, userId))
        .returning({ id: users.id }),
      this.db
        .update(authSessions)
        .set({ revokedAt: changedAt })
        .where(and(eq(authSessions.userId, userId), isNull(authSessions.revokedAt))),
    ])

    return updatedUsers.length === 1
  }

  async deleteUserAndRevokeSessions(userId: number): Promise<boolean> {
    const [, deletedUsers] = await this.db.batch([
      this.db
        .update(authSessions)
        .set({ revokedAt: new Date() })
        .where(and(eq(authSessions.userId, userId), isNull(authSessions.revokedAt))),
      this.db
        .delete(users)
        .where(eq(users.id, userId))
        .returning({ id: users.id }),
    ])

    return deletedUsers.length === 1
  }
}
