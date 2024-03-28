// External
import jwt from 'jsonwebtoken'

// Internal
import type { JWTTokenPayload } from '@features/auth/auth.types'

export const createStubJWTToken = (overrides?: Partial<JWTTokenPayload>): string => {
  const defaultJWTTokenPayload: JWTTokenPayload = {
    sub: crypto.randomUUID(),
    exp: Date.now() / 1000, // exp should be in seconds, not milliseconds.
  }

  const mergedPayload = {
    ...defaultJWTTokenPayload,
    ...overrides,
  }

  return jwt.sign(mergedPayload, '千里の道も一歩から', {
    algorithm: 'HS512',
    audience: 'https://client.philosocode.com',
    issuer: 'https://api.philosocode.com',
  })
}
