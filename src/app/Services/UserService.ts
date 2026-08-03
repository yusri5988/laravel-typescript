import { UserRepository } from '@/app/Repositories/UserRepository'
import { ValidationException } from '@/app/Exceptions/ValidationException'
import { NotFoundException } from '@/app/Exceptions/NotFoundException'
import { AuthenticationException } from '@/app/Exceptions/AuthenticationException'
import type { User, UserResource } from '@/app/Models/User'

/**
 * Service — holds business logic. Controllers stay thin:
 * they parse/validate input, call a Service, and format the response.
 */
export class UserService {
  constructor(private userRepository: UserRepository) {}

  /** Map a User row to the safe API shape (never leaks passwordHash). */
  toResource(user: User): UserResource {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    }
  }

  async all(): Promise<UserResource[]> {
    const rows = await this.userRepository.all()
    return rows.map((row) => this.toResource(row))
  }

  async find(id: number): Promise<UserResource> {
    const user = await this.userRepository.findById(id)
    if (!user) throw new NotFoundException('User')
    return this.toResource(user)
  }

  async authenticate(email: string, password: string): Promise<UserResource> {
    const user = await this.userRepository.findByEmail(email)
    if (!user || !(await this.verifyPassword(password, user.passwordHash))) {
      throw new AuthenticationException()
    }

    return this.toResource(user)
  }

  async create(data: { name: string; email: string; password: string }): Promise<UserResource> {
    const existing = await this.userRepository.findByEmail(data.email)
    if (existing) {
      throw new ValidationException({ email: ['Email is already taken.'] })
    }

    const passwordHash = await this.hashPassword(data.password)
    const user = await this.userRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
    })
    return this.toResource(user)
  }

  /** PBKDF2 password hashing using Workers Web Crypto. */
  private async hashPassword(password: string): Promise<string> {
    const iterations = 120_000
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    )
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
      key,
      256
    )

    return `pbkdf2$${iterations}$${this.toBase64Url(salt)}$${this.toBase64Url(new Uint8Array(bits))}`
  }

  private async verifyPassword(password: string, encoded: string): Promise<boolean> {
    const [algorithm, iterationValue, saltValue, hashValue] = encoded.split('$')
    if (algorithm !== 'pbkdf2' || !iterationValue || !saltValue || !hashValue) return false

    const iterations = Number(iterationValue)
    if (!Number.isSafeInteger(iterations) || iterations < 100_000 || iterations > 1_000_000) return false

    try {
      const salt = this.fromBase64Url(saltValue)
      const expected = this.fromBase64Url(hashValue)
      const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        'PBKDF2',
        false,
        ['deriveBits']
      )
      const actual = new Uint8Array(
        await crypto.subtle.deriveBits(
          { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
          key,
          expected.byteLength * 8
        )
      )

      return actual.byteLength === expected.byteLength && crypto.subtle.timingSafeEqual(actual, expected)
    } catch {
      return false
    }
  }

  private toBase64Url(bytes: Uint8Array): string {
    let binary = ''
    for (const byte of bytes) binary += String.fromCharCode(byte)
    return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
  }

  private fromBase64Url(value: string): Uint8Array {
    const padded = value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - (value.length % 4)) % 4)
    const binary = atob(padded)
    return Uint8Array.from(binary, (character) => character.charCodeAt(0))
  }
}
