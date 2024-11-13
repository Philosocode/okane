// Internal
import { baseTestObjectFactory, type TestObjectFactoryFunction } from '@tests/factories/base'

import { type AuthFormState, type PasswordRequirements } from '@features/auth/types/authForm'

const defaultAuthFormState: AuthFormState = {
  email: 'test@okane.com',
  name: 'Okane',
  password: 'coolPassword123',
  passwordConfirm: 'coolPassword123',
}

export const createTestAuthFormState: TestObjectFactoryFunction<AuthFormState> = (
  overrides,
  options,
) => {
  return baseTestObjectFactory(defaultAuthFormState, overrides, options)
}

const defaultPasswordRequirements: PasswordRequirements = {
  minLength: 12,
  requireDigit: true,
  requireLowercase: true,
  requireUppercase: true,
  requireNonAlphanumeric: true,
}

export const createTestPasswordRequirements: TestObjectFactoryFunction<PasswordRequirements> = (
  overrides,
  options,
) => {
  return baseTestObjectFactory(defaultPasswordRequirements, overrides, options)
}
