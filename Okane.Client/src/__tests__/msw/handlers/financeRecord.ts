// External
import { http, HttpResponse } from 'msw'

// Internal
import { FINANCE_RECORD_API_ROUTES } from '@features/financeRecords/constants/apiRoutes'
import { HTTP_STATUS_CODE } from '@shared/constants/http'

import type { FinanceRecord } from '@features/financeRecords/types/financeRecord'

import { createTestProblemDetails } from '@tests/factories/problemDetails'
import { wrapInAPIPaginatedResponse, wrapInAPIResponse } from '@tests/utils/apiResponse'

const handlers = {
  DELETE_FINANCE_RECORD_SUCCESS({ id }: { id: number }) {
    return http.delete(
      `/api${FINANCE_RECORD_API_ROUTES.DELETE_FINANCE_RECORD.buildPath({ id })}`,
      () => {
        return new HttpResponse(null, { status: HTTP_STATUS_CODE.NO_CONTENT_204 })
      },
    )
  },
  DELETE_FINANCE_RECORD_ERROR({ id }: { id: number }) {
    const status = HTTP_STATUS_CODE.BAD_REQUEST_400

    return http.delete(
      `/api${FINANCE_RECORD_API_ROUTES.DELETE_FINANCE_RECORD.buildPath({ id })}`,
      () => {
        return HttpResponse.json(createTestProblemDetails({ status }), { status })
      },
    )
  },
  GET_PAGINATED_FINANCE_RECORDS_SUCCESS({
    financeRecords,
    hasNextPage = true,
  }: {
    financeRecords: FinanceRecord[]
    hasNextPage?: boolean
  }) {
    return http.get(`/api${FINANCE_RECORD_API_ROUTES.GET_PAGINATED_LIST.basePath}`, () => {
      return HttpResponse.json({
        ...wrapInAPIPaginatedResponse(wrapInAPIResponse(financeRecords)),
        hasNextPage,
      })
    })
  },
  GET_PAGINATED_FINANCE_RECORDS_ERROR({ detail }: { detail?: string }) {
    return http.get(`/api${FINANCE_RECORD_API_ROUTES.GET_PAGINATED_LIST.basePath}`, () => {
      return HttpResponse.json(createTestProblemDetails({ detail }), {
        status: HTTP_STATUS_CODE.BAD_REQUEST_400,
      })
    })
  },
} as const

export const FINANCE_RECORD_HANDLERS = handlers
