// External
import { http, HttpResponse } from 'msw'

// Internal
import { AUTH_API_ROUTES } from '@features/auth/constants/apiRoutes'
import { HTTP_STATUS_CODE } from '@shared/constants/http'

const handlers = {
  LOGOUT_SUCCESS() {
    return http.post(`/api${AUTH_API_ROUTES.LOGOUT()}`, () => {
      return new HttpResponse(null, { status: HTTP_STATUS_CODE.NO_CONTENT_204 })
    })
  },
} as const

export const AUTH_HANDLERS = handlers
