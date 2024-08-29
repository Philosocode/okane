// Internal
export type AuthFormType = 'register' | 'login'

export interface AuthFormState {
  email: string
  name: string
  password: string
  passwordConfirm: string
}

export type PasswordChecks = {
  hasDigit: boolean
  hasLowercase: boolean
  hasUppercase: boolean
  hasNonAlphanumeric: boolean
  hasRequiredLength: boolean
}
