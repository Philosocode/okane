// External
import { http, HttpResponse } from 'msw'

// Internal
import { authAPIRoutes } from '@features/auth/constants/apiRoutes'

import { HTTP_STATUS_CODE } from '@shared/constants/http'

import { createTestPasswordRequirements } from '@tests/factories/authForm'
import { getMSWURL } from '@tests/utils/url'
import { wrapInAPIResponse } from '@tests/utils/apiResponse'

export const authHandlers = {
  postLogoutSuccess() {
    return http.post(getMSWURL(authAPIRoutes.logout()), () => {
      return new HttpResponse(null, { status: HTTP_STATUS_CODE.NO_CONTENT_204 })
    })
  },
  getPasswordRequirementsSuccess() {
    return http.get(getMSWURL(authAPIRoutes.passwordRequirements()), () => {
      return HttpResponse.json(wrapInAPIResponse(createTestPasswordRequirements()))
    })
  },
} as const
