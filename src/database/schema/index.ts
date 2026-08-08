import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

/**
 * Drizzle schema — the single source of truth for the database.
 * Edit here, then run `npm run db:generate` to create migrations.
 *
 * Mirrors Laravel's database/migrations file naming: YYYY_MM_DD_HHMMSS_name.
 */
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['admin', 'user'] }).notNull().default('user'),
  emailVerifiedAt: integer('email_verified_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
})

export const passwordResetTokens = sqliteTable(
  'password_reset_tokens',
  {
    email: text('email')
      .primaryKey()
      .references(() => users.email, { onDelete: 'cascade', onUpdate: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  },
  (table) => [index('password_reset_tokens_expires_at_idx').on(table.expiresAt)]
)

export const emailVerificationTokens = sqliteTable(
  'email_verification_tokens',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull().unique(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  },
  (table) => [
    index('email_verification_tokens_user_id_idx').on(table.userId),
    index('email_verification_tokens_expires_at_idx').on(table.expiresAt),
  ]
)

export const authSessions = sqliteTable(
  'auth_sessions',
  {
    id: text('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    revokedAt: integer('revoked_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  },
  (table) => [
    index('auth_sessions_user_id_idx').on(table.userId),
    index('auth_sessions_expires_at_idx').on(table.expiresAt),
  ]
)

export type UserRow = typeof users.$inferSelect
export type NewUserRow = typeof users.$inferInsert
export type AuthSessionRow = typeof authSessions.$inferSelect
export type NewAuthSessionRow = typeof authSessions.$inferInsert
