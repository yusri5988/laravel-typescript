import { eq } from 'drizzle-orm'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import * as schema from '@/database/schema'
import { users } from '@/database/schema'
import type { User } from '@/app/Models/User'

type Db = DrizzleD1Database<typeof schema>

/**
 * Repository — the only layer that talks to the database.
 * Controllers and Services never touch Drizzle directly.
 */
export class UserRepository {
  constructor(private db: Db) {}

  async findById(id: number): Promise<User | undefined> {
    const rows = await this.db.select().from(users).where(eq(users.id, id)).limit(1)
    return rows[0] as User | undefined
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const rows = await this.db.select().from(users).where(eq(users.email, email)).limit(1)
    return rows[0] as User | undefined
  }

  async all(): Promise<User[]> {
    return this.db.select().from(users) as Promise<User[]>
  }

  async create(data: { name: string; email: string; passwordHash: string }): Promise<User> {
    const [row] = await this.db.insert(users).values(data).returning()
    return row as User
  }
}
