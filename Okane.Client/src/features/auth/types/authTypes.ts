export type PasswordChecks = {
  hasDigit: boolean
  hasLowercase: boolean
  hasUppercase: boolean
  hasNonAlphanumeric: boolean
  hasRequiredLength: boolean
}

export type LoginResponse = {
  email: string
  jwtToken: string
  name: string
}

export type JWTTokenPayload = {
  email: string
  exp: number
  name: string
}
