// Internal
import { type PasswordRequirements } from '@features/auth/types/authForm'

import * as utils from '@features/auth/utils/authForm'

describe('validatePassword', () => {
  const requirements: PasswordRequirements = {
    minLength: 12,
    requireLowercase: true,
    requireUppercase: true,
    requireDigit: true,
    requireNonAlphanumeric: true,
  }

  test('checks the length', () => {
    const invalidPassword = 'a'.repeat(requirements.minLength - 1)

    let result = utils.validatePassword({
      password: invalidPassword,
      passwordConfirm: invalidPassword,
      minPasswordLength: requirements.minLength,
    })
    expect(result.passwordChecks.insufficientLength).toBe(true)

    result = utils.validatePassword({
      password: '',
      passwordConfirm: invalidPassword,
      minPasswordLength: requirements.minLength,
    })
    expect(result.passwordChecks.insufficientLength).toBe(true)

    const validPassword = 'Aa1@'.repeat(requirements.minLength)
    result = utils.validatePassword({
      password: validPassword,
      passwordConfirm: invalidPassword,
      minPasswordLength: requirements.minLength,
    })
    expect(result.passwordChecks.insufficientLength).toBeUndefined()
  })

  test('checks for a lowercase letter', () => {
    let result = utils.validatePassword({
      password: 'A',
      passwordConfirm: '',
      minPasswordLength: requirements.minLength,
    })
    expect(result.passwordChecks.missingLowercase).toBe(true)

    result = utils.validatePassword({
      password: 'a',
      passwordConfirm: '',
      minPasswordLength: requirements.minLength,
    })
    expect(result.passwordChecks.missingLowercase).toBeUndefined()
  })

  test('checks for an uppercase letter', () => {
    let result = utils.validatePassword({
      password: 'a',
      passwordConfirm: '',
      minPasswordLength: requirements.minLength,
    })
    expect(result.passwordChecks.missingUppercase).toBe(true)
    expect(result.isValid).toBe(false)

    result = utils.validatePassword({
      password: 'A',
      passwordConfirm: '',
      minPasswordLength: requirements.minLength,
    })
    expect(result.passwordChecks.missingUppercase).toBeUndefined()
    expect(result.isValid).toBe(false)
  })

  test('checks for a digit', () => {
    let result = utils.validatePassword({
      password: 'a',
      passwordConfirm: '',
      minPasswordLength: requirements.minLength,
    })
    expect(result.passwordChecks.missingDigit).toBe(true)
    expect(result.isValid).toBe(false)

    result = utils.validatePassword({
      password: '0',
      passwordConfirm: '',
      minPasswordLength: requirements.minLength,
    })
    expect(result.passwordChecks.missingDigit).toBeUndefined()
    expect(result.isValid).toBe(false)
  })

  test('checks for a non-alphanumeric character', () => {
    let result = utils.validatePassword({
      password: 'a',
      passwordConfirm: '',
      minPasswordLength: requirements.minLength,
    })
    expect(result.passwordChecks.missingNonAlphanumeric).toBe(true)
    expect(result.isValid).toBe(false)

    result = utils.validatePassword({
      password: '@',
      passwordConfirm: '',
      minPasswordLength: requirements.minLength,
    })
    expect(result.passwordChecks.missingNonAlphanumeric).toBeUndefined()
    expect(result.isValid).toBe(false)
  })

  test('checks for a matching password confirm', () => {
    let result = utils.validatePassword({
      password: 'abc',
      passwordConfirm: 'ABC',
      minPasswordLength: requirements.minLength,
    })
    expect(result.passwordChecks.invalidPasswordConfirm).toBe(true)
    expect(result.isValid).toBe(false)

    result = utils.validatePassword({
      password: '',
      passwordConfirm: '',
      minPasswordLength: requirements.minLength,
    })
    expect(result.passwordChecks.invalidPasswordConfirm).toBe(true)
    expect(result.isValid).toBe(false)

    result = utils.validatePassword({
      password: '@',
      passwordConfirm: '@',
      minPasswordLength: requirements.minLength,
    })
    expect(result.passwordChecks.missingNonAlphanumeric).toBeUndefined()
    expect(result.isValid).toBe(false)
  })

  test('checks multiple conditions', () => {
    const result = utils.validatePassword({
      password: 'a1'.repeat(requirements.minLength),
      passwordConfirm: 'ABC',
      minPasswordLength: requirements.minLength,
    })
    expect(result).toEqual({
      isValid: false,
      passwordChecks: {
        invalidPasswordConfirm: true,
        missingUppercase: true,
        missingNonAlphanumeric: true,
      },
    })
  })

  test('identifies a valid password', () => {
    const password = 'Aa1@'.repeat(requirements.minLength)
    const result = utils.validatePassword({
      password,
      passwordConfirm: password,
      minPasswordLength: requirements.minLength,
    })
    expect(result).toEqual({
      isValid: true,
      passwordChecks: {},
    })
  })
})
