// External
import { http, HttpResponse } from 'msw'

// Internal
import { authAPIRoutes } from '@features/auth/constants/apiRoutes'
import { HTTP_STATUS_CODE } from '@shared/constants/http'

export const authHandlers = {
  logoutSuccess() {
    return http.post(`/api${authAPIRoutes.logout.buildPath()}`, () => {
      return new HttpResponse(null, { status: HTTP_STATUS_CODE.NO_CONTENT_204 })
    })
  },
} as const
