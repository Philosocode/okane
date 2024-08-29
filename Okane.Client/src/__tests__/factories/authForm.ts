// Internal
import { baseTestObjectFactory, type TestObjectFactoryFunction } from '@tests/factories/base'

import type { AuthFormState } from '@features/auth/types/authForm'

const defaultState: AuthFormState = {
  email: 'test@okane.com',
  name: 'Okane',
  password: 'coolPassword123',
  passwordConfirm: 'coolPassword123',
}

export const createTestAuthFormState: TestObjectFactoryFunction<AuthFormState> = (
  overrides,
  options,
) => {
  return baseTestObjectFactory(defaultState, overrides, options)
}
