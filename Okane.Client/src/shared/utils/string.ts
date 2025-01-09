const digitSet = new Set('0123456789')
const alphabetLowercase = 'abcdefghijklmnopqrstuvwxyz'
const alphabetUppercase = alphabetLowercase.toUpperCase()
const alphabetSet = new Set(alphabetLowercase + alphabetUppercase)
const alphanumericSet = new Set([...digitSet, ...alphabetSet])

/**
 * Make the first letter of a string uppercase.
 *
 * @param s
 */
export function capitalize(s: string): string {
  if (s.length <= 1) return s.toUpperCase()
  return s[0].toUpperCase() + s.slice(1)
}

/**
 * Make the first letter of a string lowercase.
 *
 * @param s
 */
export function uncapitalize(s: string): string {
  if (s.length <= 1) return s.toLowerCase()
  return s[0].toLowerCase() + s.slice(1)
}

/**
 * Compare two strings.
 *
 * @param s1
 * @param s2
 */
export function compareStrings(s1: string, s2: string) {
  if (s1 < s2) return -1
  if (s1 === s2) return 0
  return 1
}

/**
 * Check if each character in s is in the A-Z alphabet.
 *
 * @param s
 * @returns Whether or not each character is in the A-Z alphabet.
 */
export function isAlphabetString(s: string): boolean {
  if (!s.length) return false

  for (let i = 0; i < s.length; i++) {
    if (!alphabetSet.has(s[i])) return false
  }

  return true
}

/**
 * Check if each character in s is alphanumeric.
 *
 * @param s
 * @returns Whether or not if each character is alphanumeric.
 */
export function isAlphanumericString(s: string): boolean {
  if (!s.length) return false

  for (let i = 0; i < s.length; i++) {
    if (!alphanumericSet.has(s[i])) return false
  }

  return true
}

/**
 * Check if each character in s is a digit.
 *
 * @param s
 * @returns Whether or not each character is a digit.
 */
export function isIntegerString(s: string): boolean {
  if (!s.length) return false

  for (let i = 0; i < s.length; i++) {
    if (!digitSet.has(s[i])) return false
  }

  return true
}

/**
 * Check if each character in s is lowercase.
 *
 * @param s
 * @returns Whether or not each character is lowercase.
 */
export function isLowercaseString(s: string): boolean {
  return s === s.toLowerCase()
}

/**
 * Check if each character in s is uppercase.
 *
 * @param s
 * @returns Whether or not each character is uppercase.
 */
export function isUppercaseString(s: string): boolean {
  return s === s.toUpperCase()
}

/**
 * Remove consecutive "prefix" characters from the start of a string.
 *
 * @param s
 * @param prefixCharacter
 *
 * @example removePrefixCharacter('/', '///abc') => 'abc'
 */
export function removePrefixCharacters(s: string, prefixCharacter: string): string {
  if (prefixCharacter.length === 0) return s

  let startIdx = 0
  while (s[startIdx] === prefixCharacter[0] && startIdx < s.length) {
    startIdx++
  }

  return s.slice(startIdx)
}

/**
 * Conditionally pluralize a string if amount isn't  1.
 *
 * @param args
 */
export function pluralize(args: { text: string; count?: number; suffix: string }): string {
  if (args.count == 1) return args.text
  return `${args.text}${args.suffix}`
}
