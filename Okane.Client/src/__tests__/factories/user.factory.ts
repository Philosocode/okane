// Internal
import { baseStubFactory, type StubFactoryFunction } from '@tests/factories/base.factory'

import type { User } from '@features/users/user.types'

const defaultUser: User = {
  email: 'hello@okane.com',
  name: 'Okane User',
}

export const createStubUser: StubFactoryFunction<User> = (overrides, options): User => {
  return baseStubFactory(defaultUser, overrides, options)
}
