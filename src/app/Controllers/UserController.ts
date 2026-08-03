import { factory, userServiceFrom } from '@/app/Services/AppServiceProvider'
import { issueToken } from '@/app/Middleware/Auth'
import { withData } from '@/helpers/response'
import { storeUserRequest, showUserRequest, loginUserRequest } from '@/app/Requests/UserRequest'

/**
 * Controllers — thin HTTP boundary.
 * Parse validated input -> delegate to a Service -> return JSON.
 * Validation schemas (Laravel Form Request equivalent) come from
 * `app/Requests`, business logic from `app/Services`.
 */
const store = factory.createHandlers(storeUserRequest, async (c) => {
  const body = c.req.valid('json')
  const userService = userServiceFrom(c.env)
  const user = await userService.create(body)
  return withData(user, 201)
})

const show = factory.createHandlers(showUserRequest, async (c) => {
  const { id } = c.req.valid('param')
  const userService = userServiceFrom(c.env)
  const user = await userService.find(id)
  return withData(user)
})

const index = factory.createHandlers(async (c) => {
  const userService = userServiceFrom(c.env)
  const users = await userService.all()
  return withData(users)
})

const me = factory.createHandlers(async (c) => {
  const user = c.get('user')
  if (!user) {
    return c.json({ message: 'Unauthenticated.' }, 401)
  }
  return withData(user)
})

const login = factory.createHandlers(loginUserRequest, async (c) => {
  const { email, password } = c.req.valid('json')
  const userService = userServiceFrom(c.env)
  const user = await userService.authenticate(email, password)
  const token = await issueToken(c, user)
  return c.json({ token })
})

export const UserController = {
  index,
  show,
  store,
  me,
  login,
}
