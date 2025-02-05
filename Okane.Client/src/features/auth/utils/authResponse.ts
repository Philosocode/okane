// Internal
import type { JwtTokenPayload } from '@features/auth/types/authResponse'

/**
 * Extract the payload from a JWT token.
 *
 * @param jwtToken
 * @returns The JWT payload.
 */
export function getJwtTokenPayload(jwtToken: string): JwtTokenPayload {
  const jwtBase64 = jwtToken.split('.')[1]
  return JSON.parse(atob(jwtBase64))
}
