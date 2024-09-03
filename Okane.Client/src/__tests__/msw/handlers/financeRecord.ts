// External
import { http, HttpResponse } from 'msw'

// Internal
import { financeRecordAPIRoutes } from '@features/financeRecords/constants/apiRoutes'
import { HTTP_STATUS_CODE } from '@shared/constants/http'

import type { FinanceRecord } from '@features/financeRecords/types/financeRecord'

import { createTestProblemDetails } from '@tests/factories/problemDetails'
import { wrapInAPIPaginatedResponse, wrapInAPIResponse } from '@tests/utils/apiResponse'

export const financeRecordHandlers = {
  deleteFinanceRecordSuccess({ id }: { id: number }) {
    return http.delete(
      `/api${financeRecordAPIRoutes.deleteFinanceRecord.buildPath({ id })}`,
      () => {
        return new HttpResponse(null, { status: HTTP_STATUS_CODE.NO_CONTENT_204 })
      },
    )
  },
  deleteFinanceRecordError({ id }: { id: number }) {
    const status = HTTP_STATUS_CODE.BAD_REQUEST_400

    return http.delete(
      `/api${financeRecordAPIRoutes.deleteFinanceRecord.buildPath({ id })}`,
      () => {
        return HttpResponse.json(createTestProblemDetails({ status }), { status })
      },
    )
  },
  getPaginatedFinanceRecordsSuccess({
    financeRecords,
    hasNextPage = true,
  }: {
    financeRecords: FinanceRecord[]
    hasNextPage?: boolean
  }) {
    return http.get(`/api${financeRecordAPIRoutes.getPaginatedList.basePath}`, () => {
      return HttpResponse.json({
        ...wrapInAPIPaginatedResponse(wrapInAPIResponse(financeRecords)),
        hasNextPage,
      })
    })
  },
  getPaginatedFinanceRecordsError({ detail }: { detail?: string }) {
    return http.get(`/api${financeRecordAPIRoutes.getPaginatedList.basePath}`, () => {
      return HttpResponse.json(createTestProblemDetails({ detail }), {
        status: HTTP_STATUS_CODE.BAD_REQUEST_400,
      })
    })
  },
} as const
