// External
import jwt from 'jsonwebtoken'

// Internal
import type { JwtTokenPayload } from '@features/auth/types/authResponse'

export const createTestJwtToken = (overrides?: Partial<JwtTokenPayload>): string => {
  const defaultJwtTokenPayload: JwtTokenPayload = {
    sub: crypto.randomUUID(),
    exp: Date.now() / 1000, // exp should be in seconds, not milliseconds.
  }

  const mergedPayload = {
    ...defaultJwtTokenPayload,
    ...overrides,
  }

  return jwt.sign(mergedPayload, '千里の道も一歩から', {
    algorithm: 'HS512',
    audience: 'https://client.philosocode.com',
    issuer: 'https://api.philosocode.com',
  })
}
