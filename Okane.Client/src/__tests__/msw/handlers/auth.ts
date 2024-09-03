// External
import { http, HttpResponse } from 'msw'

// Internal
import { AUTH_API_ROUTES } from '@features/auth/constants/apiRoutes'
import { HTTP_STATUS_CODE } from '@shared/constants/http'

export const authHandlers = {
  logoutSuccess() {
    return http.post(`/api${AUTH_API_ROUTES.LOGOUT.buildPath()}`, () => {
      return new HttpResponse(null, { status: HTTP_STATUS_CODE.NO_CONTENT_204 })
    })
  },
} as const
