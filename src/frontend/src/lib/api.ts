const TOKEN_KEY = 'hono_laravel_token'

export type UserResource = {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
  createdAt: string
  emailVerifiedAt: string | null
}

type ApiEnvelope<T> = { data: T }
type ApiError = { message: string; errors?: Record<string, string[]> }

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export class ApiErrorException extends Error {
  constructor(message: string, public errors?: Record<string, string[]>) {
    super(message)
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body) headers.set('Content-Type', 'application/json')

  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(path, { ...init, headers })
  const body = (await res.json().catch(() => null)) as ApiEnvelope<T> & ApiError | null

  if (!res.ok) {
    throw new ApiErrorException(
      body?.message ?? 'Request failed.',
      body?.errors
    )
  }

  return body!.data
}

export const api = {
  login(email: string, password: string) {
    return request<{ token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  register(data: { name: string; email: string; password: string }) {
    return request<UserResource>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  me() {
    return request<UserResource>('/api/users/me')
  },

  updateProfile(data: { name?: string; email?: string }) {
    return request<UserResource>('/api/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  updatePassword(data: { currentPassword: string; password: string; passwordConfirmation: string }) {
    return request<{ message: string }>('/api/users/password', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  deleteAccount(password: string) {
    return request<{ message: string }>('/api/users/profile', {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    })
  },

  logout() {
    return request<{ message: string }>('/api/auth/logout', { method: 'POST' })
  },
}