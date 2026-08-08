import { sign, verify } from 'hono/jwt'
import { AuthenticationException } from '@/app/Exceptions/AuthenticationException'
import { NotFoundException } from '@/app/Exceptions/NotFoundException'
import type { AuthRepositoryContract } from '@/app/Repositories/AuthRepository'
import type { UserResource } from '@/app/Models/User'
import { UserService } from '@/app/Services/UserService'
import { authConfig } from '@/config/app'

type AuthenticatedIdentity = {
  user: UserResource
  sessionId: string
}

export class AuthService {
  constructor(
    private userService: UserService,
    private authRepository: AuthRepositoryContract,
    private secret: string
  ) {}

  async register(data: { name: string; email: string; password: string }): Promise<UserResource> {
    return this.userService.create(data)
  }

  async login(email: string, password: string): Promise<string> {
    this.assertSecretConfigured()
    const user = await this.userService.authenticate(email, password)
    const sessionId = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + authConfig.jwtTtlSeconds * 1000)

    const token = await sign(
      {
        sub: String(user.id),
        jti: sessionId,
        exp: Math.floor(expiresAt.getTime() / 1000),
      },
      this.secret,
      'HS256'
    )

    await this.authRepository.createSession({
      id: sessionId,
      userId: user.id,
      expiresAt,
    })

    return token
  }

  async authenticateToken(token: string): Promise<AuthenticatedIdentity> {
    this.assertSecretConfigured()

    let payload: Awaited<ReturnType<typeof verify>>
    try {
      payload = await verify(token, this.secret, 'HS256')
    } catch {
      throw new AuthenticationException('Invalid token.')
    }

    const userId = Number(payload.sub)
    const sessionId = typeof payload.jti === 'string' ? payload.jti : ''
    if (!Number.isSafeInteger(userId) || userId <= 0 || !sessionId) {
      throw new AuthenticationException('Invalid token.')
    }

    const session = await this.authRepository.findActiveSession(sessionId, userId, new Date())
    if (!session) throw new AuthenticationException('Invalid token.')

    try {
      const user = await this.userService.find(userId)
      return { user, sessionId }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new AuthenticationException('Invalid token.')
      }
      throw error
    }
  }

  async logout(userId: number, sessionId: string): Promise<void> {
    await this.authRepository.revokeSession(sessionId, userId, new Date())
  }

  async updatePassword(userId: number, currentPassword: string, password: string): Promise<void> {
    const passwordHash = await this.userService.preparePasswordChange(userId, currentPassword, password)
    const updated = await this.authRepository.updatePasswordAndRevokeSessions(
      userId,
      passwordHash,
      new Date()
    )
    if (!updated) throw new NotFoundException('User')
  }

  private assertSecretConfigured(): void {
    if (!this.secret) throw new Error('JWT_SECRET is not configured.')
  }
}
