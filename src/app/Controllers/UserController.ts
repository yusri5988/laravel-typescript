import { authServiceFrom, factory, userServiceFrom } from '@/app/Services/AppServiceProvider'
import { paginated, withData } from '@/helpers/response'
import { listUsersRequest, storeUserRequest, showUserRequest, updateProfileRequest, updatePasswordRequest, deleteAccountRequest } from '@/app/Requests/UserRequest'

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

const index = factory.createHandlers(listUsersRequest, async (c) => {
  const { page, perPage } = c.req.valid('query')
  const result = await userServiceFrom(c.env).paginate(page, perPage)
  return paginated(result.data, result.meta)
})

const me = factory.createHandlers(async (c) => {
  return withData(c.get('user')!)
})

const profileUpdate = factory.createHandlers(updateProfileRequest, async (c) => {
  const updated = await userServiceFrom(c.env).updateProfile(c.get('user')!.id, c.req.valid('json'))
  return withData(updated)
})

const passwordUpdate = factory.createHandlers(updatePasswordRequest, async (c) => {
  const body = c.req.valid('json')
  await authServiceFrom(c.env).updatePassword(c.get('user')!.id, body.currentPassword, body.password)
  return withData({ message: 'Password updated. Please log in again.' })
})

const profileDelete = factory.createHandlers(deleteAccountRequest, async (c) => {
  const body = c.req.valid('json')
  await authServiceFrom(c.env).deleteUserAndRevokeSessions(c.get('user')!.id, body.password)
  return withData({ message: 'Account deleted successfully.' })
})

export const UserController = {
  index,
  show,
  store,
  me,
  profileUpdate,
  passwordUpdate,
  profileDelete,
}
