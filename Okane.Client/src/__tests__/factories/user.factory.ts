// Internal
import { baseMockFactory } from '@tests/factories/base.factory'

import type { User } from '@/features/users/user.types'

const defaultUser: User = {
  email: 'hello@okane.com',
  name: 'Okane User',
}

export function createMockUser() {
  return baseMockFactory.bind(null, defaultUser)
}
