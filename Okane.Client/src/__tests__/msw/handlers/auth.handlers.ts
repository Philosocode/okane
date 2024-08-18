// External
import { http, HttpResponse } from 'msw'

// Internal
import { testServer } from '@tests/msw/testServer'

export const AUTH_HANDLER_MAP = {
  LOGOUT_SUCCESS: http.post('/api/auth/logout', () => {
    return HttpResponse.json()
  }),
} as const

export function setUpAuthHandlers() {
  testServer.use(...Object.values(AUTH_HANDLER_MAP))
}
