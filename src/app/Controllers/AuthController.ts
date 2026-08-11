import { factory, authServiceFrom } from '@/app/Services/AppServiceProvider'
import { loginUserRequest, storeUserRequest } from '@/app/Requests/UserRequest'
import { withData } from '@/helpers/response'

const login = factory.createHandlers(loginUserRequest, async (c) => {
  const { email, password } = c.req.valid('json')
  const token = await authServiceFrom(c.env).login(email, password)
  return withData({ token })
})

const register = factory.createHandlers(storeUserRequest, async (c) => {
  const user = await authServiceFrom(c.env).register(c.req.valid('json'))
  return withData(user, 201)
})

const logout = factory.createHandlers(async (c) => {
  const user = c.get('user')!
  const sessionId = c.get('authSessionId')!
  await authServiceFrom(c.env).logout(user.id, sessionId)
  return withData({ message: 'Logged out.' })
})

export const AuthController = { login, register, logout }
