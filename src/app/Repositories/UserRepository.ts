import { asc, count, eq } from 'drizzle-orm'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import * as schema from '@/database/schema'
import { users } from '@/database/schema'
import type { User } from '@/app/Models/User'
import { DuplicateUserEmailError } from '@/app/Exceptions/DuplicateUserEmailError'

type Db = DrizzleD1Database<typeof schema>

export type CreateUserData = {
  name: string
  email: string
  passwordHash: string
  role?: User['role']
}

export type UpdateUserData = {
  name?: string
  email?: string
  passwordHash?: string
}

export type UserPage = {
  rows: User[]
  total: number
}

export interface UserRepositoryContract {
  findById(id: number): Promise<User | undefined>
  findByEmail(email: string): Promise<User | undefined>
  paginate(page: number, perPage: number): Promise<UserPage>
  create(data: CreateUserData): Promise<User>
  update(id: number, data: UpdateUserData): Promise<User | undefined>
  delete(id: number): Promise<boolean>
}

export class UserRepository implements UserRepositoryContract {
  constructor(private db: Db) {}

  async findById(id: number): Promise<User | undefined> {
    const rows = await this.db.select().from(users).where(eq(users.id, id)).limit(1)
    return rows[0]
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const rows = await this.db.select().from(users).where(eq(users.email, email)).limit(1)
    return rows[0]
  }

  async paginate(page: number, perPage: number): Promise<UserPage> {
    const offset = (page - 1) * perPage
    const [rows, totals] = await this.db.batch([
      this.db.select().from(users).orderBy(asc(users.id)).limit(perPage).offset(offset),
      this.db.select({ total: count() }).from(users),
    ])

    return {
      rows,
      total: totals[0]?.total ?? 0,
    }
  }

  async create(data: CreateUserData): Promise<User> {
    try {
      const [row] = await this.db.insert(users).values(data).returning()
      if (!row) throw new Error('User insert returned no row.')
      return row
    } catch (error) {
      if (this.isDuplicateEmail(error)) throw new DuplicateUserEmailError()
      throw error
    }
  }

  async update(id: number, data: UpdateUserData): Promise<User | undefined> {
    try {
      const [row] = await this.db
        .update(users)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning()
      return row
    } catch (error) {
      if (this.isDuplicateEmail(error)) throw new DuplicateUserEmailError()
      throw error
    }
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db.delete(users).where(eq(users.id, id)).returning({ id: users.id })
    return result.length > 0
  }

  private isDuplicateEmail(error: unknown): boolean {
    return error instanceof Error
      && /UNIQUE constraint failed: users\.email|users_email_unique/i.test(error.message)
  }
}
