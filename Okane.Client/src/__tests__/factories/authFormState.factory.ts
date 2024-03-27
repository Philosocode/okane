// Internal
import type { AuthFormState } from '@features/auth/auth.types'

import { baseMockFactory, type MockFactoryFunction } from '@tests/factories/base.factory'

const defaultState: AuthFormState = {
  email: 'test@okane.com',
  name: 'Okane',
  password: 'coolPassword123',
  passwordConfirm: 'coolPassword123',
}

export const createMockAuthFormState: MockFactoryFunction<AuthFormState> = (overrides, options) => {
  return baseMockFactory(defaultState, overrides, options)
}
