// External
import { http, HttpResponse } from 'msw'

// Internal
import { authApiRoutes } from '@features/auth/constants/apiRoutes'

import { HTTP_STATUS_CODE } from '@shared/constants/http'

import { createTestPasswordRequirements } from '@tests/factories/passwordRequirements'
import { createTestProblemDetails } from '@tests/factories/problemDetails'
import { getMswUrl } from '@tests/utils/url'
import { wrapInApiResponse } from '@tests/utils/apiResponse'

export const authHandlers = {
  postLogoutSuccess() {
    return http.post(getMswUrl(authApiRoutes.logout()), () => {
      return new HttpResponse(null, { status: HTTP_STATUS_CODE.NO_CONTENT_204 })
    })
  },
  getPasswordRequirementsSuccess() {
    return http.get(getMswUrl(authApiRoutes.passwordRequirements()), () => {
      return HttpResponse.json(wrapInApiResponse(createTestPasswordRequirements()))
    })
  },
  getPasswordRequirementsError() {
    return http.get(getMswUrl(authApiRoutes.passwordRequirements()), () =>
      HttpResponse.json(createTestProblemDetails(), {
        status: HTTP_STATUS_CODE.BAD_REQUEST_400,
      }),
    )
  },
} as const
