// Internal
import { type PasswordChecks } from '@features/auth/types/authForm'

import * as stringUtils from '@shared/utils/string'

/**
 * Check if a password is valid based on the given requirements.
 *
 * @param args
 */
export function validatePassword(args: {
  password: string
  passwordConfirm: string
  minPasswordLength: number
}): {
  isValid: boolean
  passwordChecks: PasswordChecks
} {
  const checks: PasswordChecks = {}
  const has = {
    digit: false,
    nonAlphanumeric: false,
    lowercase: false,
    uppercase: false,
  }
  let validRequirements = 0

  for (let i = 0; i < args.password.length && validRequirements < Object.keys(has).length; i++) {
    const currChar = args.password[i]

    if (!has.digit && stringUtils.isIntegerString(currChar)) {
      has.digit = true
      validRequirements++
    }

    if (!has.nonAlphanumeric && !stringUtils.isAlphanumericString(currChar)) {
      has.nonAlphanumeric = true
      validRequirements++
    }

    if (stringUtils.isAlphabetString(currChar)) {
      if (!has.lowercase && stringUtils.isLowercaseString(currChar)) {
        has.lowercase = true
        validRequirements++
      }

      if (!has.uppercase && stringUtils.isUppercaseString(currChar)) {
        has.uppercase = true
        validRequirements++
      }
    }
  }

  if (args.password.length < args.minPasswordLength) checks.insufficientLength = true
  if (!has.digit) checks.missingDigit = true
  if (!has.nonAlphanumeric) checks.missingNonAlphanumeric = true
  if (!has.lowercase) checks.missingLowercase = true
  if (!has.uppercase) checks.missingUppercase = true
  if (!args.passwordConfirm || args.password !== args.passwordConfirm) {
    checks.invalidPasswordConfirm = true
  }

  return {
    isValid: Object.getOwnPropertyNames(checks).length === 0,
    passwordChecks: checks,
  }
}
