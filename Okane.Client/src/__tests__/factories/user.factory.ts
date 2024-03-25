// Internal
import {
  baseMockFactory,
  type MockFactoryFunction,
} from '@tests/factories/base.factory'

import type { User } from '@/features/users/user.types'

const defaultUser: User = {
  email: 'hello@okane.com',
  name: 'Okane User',
}

export const createMockUser: MockFactoryFunction<User> = (
  overrides,
  options,
): User => {
  return baseMockFactory(defaultUser, overrides, options)
}
