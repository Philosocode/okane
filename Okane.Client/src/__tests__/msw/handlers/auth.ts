// External
import { http, HttpResponse } from 'msw'

// Internal
import { authAPIRoutes } from '@features/auth/constants/apiRoutes'

import { HTTP_STATUS_CODE } from '@shared/constants/http'

import { createTestPasswordRequirements } from '@tests/factories/passwordRequirements'
import { createTestProblemDetails } from '@tests/factories/problemDetails'
import { getMSWURL } from '@tests/utils/url'
import { wrapInApiResponse } from '@tests/utils/apiResponse'

export const authHandlers = {
  postLogoutSuccess() {
    return http.post(getMSWURL(authAPIRoutes.logout()), () => {
      return new HttpResponse(null, { status: HTTP_STATUS_CODE.NO_CONTENT_204 })
    })
  },
  getPasswordRequirementsSuccess() {
    return http.get(getMSWURL(authAPIRoutes.passwordRequirements()), () => {
      return HttpResponse.json(wrapInApiResponse(createTestPasswordRequirements()))
    })
  },
  getPasswordRequirementsError() {
    return http.get(getMSWURL(authAPIRoutes.passwordRequirements()), () =>
      HttpResponse.json(createTestProblemDetails(), {
        status: HTTP_STATUS_CODE.BAD_REQUEST_400,
      }),
    )
  },
} as const
