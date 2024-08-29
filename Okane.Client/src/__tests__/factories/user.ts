// Internal
import { baseTestObjectFactory, type TestObjectFactoryFunction } from '@tests/factories/base'

import type { User } from '@features/users/types'

const defaultUser: User = {
  email: 'hello@okane.com',
  name: 'Okane User',
}

export const createTestUser: TestObjectFactoryFunction<User> = (overrides, options): User => {
  return baseTestObjectFactory(defaultUser, overrides, options)
}
