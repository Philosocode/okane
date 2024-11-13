// Internal
export type AuthFormType = 'register' | 'login'

export interface AuthFormState {
  email: string
  name: string
  password: string
  passwordConfirm: string
}

export type PasswordChecks = {
  insufficientLength?: boolean
  invalidPasswordConfirm?: boolean
  missingDigit?: boolean
  missingLowercase?: boolean
  missingUppercase?: boolean
  missingNonAlphanumeric?: boolean
}

export type PasswordRequirements = {
  minLength: number
  requireDigit: boolean
  requireLowercase: boolean
  requireUppercase: boolean
  requireNonAlphanumeric: boolean
}
