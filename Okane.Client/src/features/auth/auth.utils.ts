// Internal
import { MIN_PASSWORD_LENGTH } from '@features/auth/auth.constants'

import type { JWTTokenPayload, PasswordChecks } from '@features/auth/auth.types'

import * as stringUtils from '@shared/utils/string.utils'

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

/**
 * Extract the payload from a JWT token.
 *
 * @param jwtToken
 * @returns The JWT payload.
 */
export function getJWTTokenPayload(jwtToken: string): JWTTokenPayload {
  const jwtBase64 = jwtToken.split('.')[1]
  return JSON.parse(atob(jwtBase64))
}
