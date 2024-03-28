// Internal
import type { AuthFormState } from '@features/auth/auth.types'

import { baseStubFactory, type StubFactoryFunction } from '@tests/factories/base.factory'

const defaultState: AuthFormState = {
  email: 'test@okane.com',
  name: 'Okane',
  password: 'coolPassword123',
  passwordConfirm: 'coolPassword123',
}

export const createStubAuthFormState: StubFactoryFunction<AuthFormState> = (overrides, options) => {
  return baseStubFactory(defaultState, overrides, options)
}
