// Internal
import { createTestJwtToken } from '@tests/factories/jwtToken'

import { type JwtTokenPayload } from '@features/auth/types/authResponse'

import { getJwtTokenPayload } from '@features/auth/utils/authResponse'

test('getJwtTokenPayload', () => {
  const originalToken: JwtTokenPayload = {
    sub: crypto.randomUUID(),
    exp: Date.now(),
  }

  const signedToken = createTestJwtToken(originalToken)
  const parsedToken = getJwtTokenPayload(signedToken)

  expect(parsedToken.exp).toBe(originalToken.exp)
  expect(parsedToken.sub).toBe(originalToken.sub)
})
