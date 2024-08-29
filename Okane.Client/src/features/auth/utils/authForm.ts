import type { PasswordChecks } from '@features/auth/types/authForm'
import { MIN_PASSWORD_LENGTH } from '@features/auth/constants/authForm'
import * as stringUtils from '@shared/utils/string'

/**
 * Check if a password is valid. See Okane.Api/Features/Auth/Extensions/AuthExtensions.cs for valid password criteria.
 *
 * This is true if:
 * - length >= MIN_PASSWORD_LENGTH
 * - has a digit
 * - has a lowercase character
 * - has an uppercase character
 * - has a non-alphanumeric character
 *
 * @param password
 * @returns Whether or not the password is valid along with the password checks.
 */
export function isValidPassword(password: string): {
  isValid: boolean
  passwordChecks: PasswordChecks
} {
  const checks: PasswordChecks = {
    hasDigit: false,
    hasLowercase: false,
    hasRequiredLength: password.length >= MIN_PASSWORD_LENGTH,
    hasUppercase: false,
    hasNonAlphanumeric: false,
  }

  for (const currChar of password) {
    if (!checks.hasDigit && stringUtils.isIntegerString(currChar)) {
      checks.hasDigit = true
    }

    if (!checks.hasNonAlphanumeric && !stringUtils.isAlphanumericString(currChar)) {
      checks.hasNonAlphanumeric = true
    }

    if (stringUtils.isAlphabetString(currChar)) {
      if (!checks.hasLowercase && stringUtils.isLowercaseString(currChar)) {
        checks.hasLowercase = true
      }

      if (!checks.hasUppercase && stringUtils.isUppercaseString(currChar)) {
        checks.hasUppercase = true
      }
    }
  }

  return {
    isValid: !Object.values(checks).includes(false),
    passwordChecks: checks,
  }
}
