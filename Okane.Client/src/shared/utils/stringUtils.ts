const digitSet = new Set('0123456789')
const alphabetLowercase = 'abcdefghijklmnopqrstuvwxyz'
const alphabetUppercase = alphabetLowercase.toUpperCase()
const alphabetSet = new Set(alphabetLowercase + alphabetUppercase)
const alphanumericSet = new Set([...digitSet, ...alphabetSet])

// Check if each character in s is in the A-Z alphabet.
export function isAlphabetString(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    if (!alphabetSet.has(s[i])) return false
  }

  return true
}

// Check if each character in s is alphanumeric.
export function isAlphanumericString(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    if (!alphanumericSet.has(s[i])) return false
  }

  return true
}

// Check if each character in s is a digit.
export function isIntegerString(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    if (!digitSet.has(s[i])) return false
  }

  return true
}

// Check if each character in s is lowercase.
export function isLowercaseString(s: string): boolean {
  return s === s.toLowerCase()
}

// Check if each character in s is uppercase.
export function isUppercaseString(s: string): boolean {
  return s === s.toUpperCase()
}
