// Internal
import { createTestJWTToken } from '@tests/factories/jwtToken'

import { type JWTTokenPayload } from '@features/auth/types/authResponse'

import { getJWTTokenPayload } from '@features/auth/utils/authResponse'

test('getJWTTokenPayload', () => {
  const originalToken: JWTTokenPayload = {
    sub: crypto.randomUUID(),
    exp: Date.now(),
  }

  const signedToken = createTestJWTToken(originalToken)
  const parsedToken = getJWTTokenPayload(signedToken)

  expect(parsedToken.exp).toBe(originalToken.exp)
  expect(parsedToken.sub).toBe(originalToken.sub)
})
