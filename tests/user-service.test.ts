import { describe, it, expect } from 'vitest'
import { UserService } from '@/app/Services/UserService'
import { ValidationException } from '@/app/Exceptions/ValidationException'
import { NotFoundException } from '@/app/Exceptions/NotFoundException'
import { AuthenticationException } from '@/app/Exceptions/AuthenticationException'
import type { UserRepository } from '@/app/Repositories/UserRepository'
import type { User } from '@/app/Models/User'

const fakeUser: User = {
  id: 1,
  name: 'Alice Example',
  email: 'alice@example.com',
  passwordHash: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
}

function repo(overrides: Partial<Record<keyof UserRepository, unknown>> = {}): UserRepository {
  return {
    findById: async () => undefined,
    findByEmail: async () => undefined,
    all: async () => [],
    create: async (data: { name: string; email: string; passwordHash: string }) => ({ ...fakeUser, ...data }),
    ...overrides,
  } as unknown as UserRepository
}

describe('UserService', () => {
  it('maps a user to a safe resource (no passwordHash)', async () => {
    const service = new UserService(repo())
    const resource = service.toResource(fakeUser)
    expect(resource).toEqual({
      id: 1,
      name: 'Alice Example',
      email: 'alice@example.com',
      createdAt: fakeUser.createdAt,
    })
    expect(resource).not.toHaveProperty('passwordHash')
  })

  it('throws NotFoundException when user is missing', async () => {
    const service = new UserService(repo())
    await expect(service.find(999)).rejects.toBeInstanceOf(NotFoundException)
  })

  it('rejects duplicate emails with 422 ValidationException', async () => {
    const service = new UserService(repo({ findByEmail: async () => fakeUser }))
    await expect(
      service.create({ name: 'Alice', email: 'alice@example.com', password: 'password123' })
    ).rejects.toBeInstanceOf(ValidationException)
  })

  it('creates a user and hashes the password', async () => {
    const service = new UserService(repo())
    const resource = await service.create({
      name: 'New User',
      email: 'new@example.com',
      password: 'password123',
    })
    expect(resource.id).toBe(1)
    expect(resource.email).toBe('new@example.com')
  })

  it('authenticates with the correct password and rejects the wrong password', async () => {
    let savedUser: User | undefined
    const repository = repo({
      create: async (data: { name: string; email: string; passwordHash: string }) => {
        savedUser = { ...fakeUser, ...data }
        return savedUser
      },
      findByEmail: async () => savedUser,
    })
    const service = new UserService(repository)

    await service.create({ name: 'New User', email: 'new@example.com', password: 'password123' })

    await expect(service.authenticate('new@example.com', 'password123')).resolves.toMatchObject({
      email: 'new@example.com',
    })
    await expect(service.authenticate('new@example.com', 'wrong-password')).rejects.toBeInstanceOf(
      AuthenticationException
    )
  })
})
