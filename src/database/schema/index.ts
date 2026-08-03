import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'

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
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
})

export type UserRow = typeof users.$inferSelect
export type NewUserRow = typeof users.$inferInsert
