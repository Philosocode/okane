// External
import { http, HttpResponse } from 'msw'

// Internal
import { AUTH_API_ROUTES } from '@features/auth/constants/apiRoutes'

import { testServer } from '@tests/msw/testServer'

export const AUTH_HANDLER_MAP = {
  LOGOUT_SUCCESS: http.post(`/api${AUTH_API_ROUTES.LOGOUT.basePath}`, () => {
    return HttpResponse.json()
  }),
} as const

export function setUpAuthHandlers() {
  testServer.use(...Object.values(AUTH_HANDLER_MAP))
}
