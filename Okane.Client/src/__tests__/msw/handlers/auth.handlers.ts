// External
import { http, HttpResponse, RequestHandler, type HttpHandler } from 'msw'

// Internal
import { testServer } from '@tests/msw/testServer'

export const AUTH_HANDLER_MAP = {
  LOGOUT_SUCCESS: http.post('/api/auth/logout', () => {
    return HttpResponse.json()
  }),
} as const

const authHandlers: RequestHandler[] = Object.values(AUTH_HANDLER_MAP)

export function setUpAuthHandlers() {
  testServer.use(...authHandlers)
}
