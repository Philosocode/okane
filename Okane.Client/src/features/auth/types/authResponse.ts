// Internal
import type { APIResponse } from '@shared/services/apiClient/types'
import type { User } from '@features/users/types'

export type JWTTokenPayload = {
  exp: number
  sub: string
}
export type AuthenticateResponse = APIResponse<{
  jwtToken: string
  user: User
}>
