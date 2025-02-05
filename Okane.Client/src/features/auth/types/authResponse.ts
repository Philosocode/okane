// Internal
import type { ApiResponse } from '@shared/services/apiClient/types'
import type { User } from '@features/users/types'

export type JwtTokenPayload = {
  exp: number
  sub: string
}
export type AuthenticateResponse = ApiResponse<{
  jwtToken: string
  user: User
}>
