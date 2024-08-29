// Internal
import { MIN_PASSWORD_LENGTH } from '@features/auth/constants/authForm'

import { type PasswordChecks } from '@features/auth/types/authForm'

import { isValidPassword } from '@features/auth/utils/authForm'

const invalidPasswordChecks: PasswordChecks = {
  hasDigit: false,
  hasLowercase: false,
  hasNonAlphanumeric: false,
  hasRequiredLength: false,
  hasUppercase: false,
}

const validPasswordChecks = Object.keys(invalidPasswordChecks).reduce(
  (checks, key) => ({
    ...checks,
    [key]: true,
  }),
  {},
)

describe('isValidPassword', () => {
  test.each([
    ['', false, invalidPasswordChecks],
    [' ', false, { hasNonAlphanumeric: true }],
    ['1', false, { hasDigit: true }],
    ['a', false, { hasLowercase: true }],
    ['A', false, { hasUppercase: true }],
    ['a'.repeat(MIN_PASSWORD_LENGTH - 1), false, { hasRequiredLength: false }],
    ['a'.repeat(MIN_PASSWORD_LENGTH), false, { hasRequiredLength: true }],
    [` aA1${'a'.repeat(MIN_PASSWORD_LENGTH - 4)}`, true, validPasswordChecks],
  ])(
    `isValidPassword('%s') => { isValid: %s, passwordChecks: %o }`,
    (password, isValid, checks) => {
      const result = isValidPassword(password)
      expect(result.isValid).toBe(isValid)
      expect(result.passwordChecks).toEqual(expect.objectContaining(checks))
    },
  )
})
