// Internal
import { type PasswordRequirements } from '@features/auth/types/authForm'
import { baseTestObjectFactory, type TestObjectFactoryFunction } from '@tests/factories/base'

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
