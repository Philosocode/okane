// Internal
import { HONEYPOT_INPUT_NAME } from '@shared/constants/form'

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

export type RegisterRequest = {
  email: string
  name: string
  password: string
  [HONEYPOT_INPUT_NAME]: string
}

export type LoginRequest = {
  email: string
  password: string
  [HONEYPOT_INPUT_NAME]: string
}
