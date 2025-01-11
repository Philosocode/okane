// External
import { http, HttpResponse } from 'msw'

// Internal
import { financeUserTagAPIRoutes } from '@features/financeUserTags/constants/apiRoutes'
import { HTTP_STATUS_CODE } from '@shared/constants/http'

import { type APIResponse } from '@shared/services/apiClient/types'
import {
  type CreateFinanceUserTagRequest,
  type FinanceUserTag,
} from '@features/financeUserTags/types/financeUserTag'

import { createTestFinanceUserTag } from '@tests/factories/financeUserTag'
import { createTestTag } from '@tests/factories/tag'
import { getMSWURL } from '@tests/utils/url'
import { wrapInAPIResponse } from '@tests/utils/apiResponse'
import { createTestProblemDetails } from '@tests/factories/problemDetails'

export const financeUserTagHandlers = {
  getAllSuccess(args: { userTags: FinanceUserTag[] }) {
    return http.get(getMSWURL(financeUserTagAPIRoutes.getAll()), () => {
      return HttpResponse.json(wrapInAPIResponse(args.userTags))
    })
  },
  getAllError() {
    return http.get(getMSWURL(financeUserTagAPIRoutes.getAll()), () =>
      HttpResponse.json(createTestProblemDetails(), {
        status: HTTP_STATUS_CODE.BAD_REQUEST_400,
      }),
    )
  },

  postSuccess({
    createdTagId,
    createdUserTagId = createdTagId,
  }: {
    createdTagId: number
    createdUserTagId?: number
  }) {
    return http.post<never, CreateFinanceUserTagRequest, APIResponse<FinanceUserTag>>(
      getMSWURL(financeUserTagAPIRoutes.post()),
      async function resolver({ request }) {
        const requestUserTag = await request.json()

        return HttpResponse.json(
          wrapInAPIResponse(
            createTestFinanceUserTag({
              id: createdUserTagId,
              tag: createTestTag({ id: createdTagId, name: requestUserTag.name }),
              type: requestUserTag.type,
            }),
          ),
        )
      },
    )
  },
} as const
