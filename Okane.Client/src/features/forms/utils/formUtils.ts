// External
import { ref } from 'vue'

// Internal
import * as stringUtils from '@/shared/utils/stringUtils'

const formIdRef = ref(0);

// Return a unique value that can be used for a form control.
export function getUniqueFormId() {
  formIdRef.value++
  return String(formIdRef.value)
}

/**
 * Check if a password is valid. See Okane.Api/AddIdentityApiEndpoints for valid password criteria.
 *
 * This is true if:
 * - length >= 12
 * - has a digit
 * - has a lowercase character
 * - has an uppercase character
 * - has a non-alphanumeric character
 *
 * @param {string} password
 * @return {boolean} Whether or not the given password is valid.
 */
export function isValidPassword(password: string): boolean {
  if (password.length < 12) return false;

  const characterValidations = {
    hasDigit: false,
    hasLowercase: false,
    hasUppercase: false,
    hasNonAlphanumeric: false,
  }

  for (const currChar of password) {
    if (!characterValidations.hasDigit && stringUtils.isIntegerString(currChar)) {
      characterValidations.hasDigit = true;
    }

    if (!characterValidations.hasLowercase && stringUtils.isLowercaseString(currChar)) {
      characterValidations.hasLowercase = true;
    }

    if (!characterValidations.hasUppercase && stringUtils.isUppercaseString(currChar)) {
      characterValidations.hasUppercase = true;
    }

    if (!characterValidations.hasNonAlphanumeric && stringUtils.isAlphanumericString(currChar)) {
      characterValidations.hasNonAlphanumeric = true;
    }
  }

  return !Object.values(characterValidations).includes(false)
}
