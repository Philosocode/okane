// External
import { http, HttpResponse, RequestHandler } from 'msw'

// Internal
import { DEFAULT_PAGE_SIZE } from '@shared/constants/request'
import { FINANCE_RECORD_API_ROUTES } from '@features/financeRecords/constants/apiRoutes'
import { HTTP_STATUS_CODE } from '@shared/constants/http'

import type { FinanceRecord } from '@features/financeRecords/types/financeRecord'

import { testServer } from '@tests/msw/testServer'

import { createTestFinanceRecord } from '@tests/factories/financeRecord'
import { createTestProblemDetails } from '@tests/factories/problemDetails'
import { getRange } from '@shared/utils/array'
import { wrapInAPIPaginatedResponse, wrapInAPIResponse } from '@tests/utils/apiResponse'

function getStubbedFinanceRecords(numRecords: number): FinanceRecord[] {
  return getRange({ end: numRecords }).map((n) =>
    createTestFinanceRecord({
      id: n,
      description: `Description ${n}`,
    }),
  )
}

export const FINANCE_RECORD_HANDLER_FACTORY = {
  DELETE_FINANCE_RECORD_SUCCESS(id: number) {
    return http.delete(`/api${FINANCE_RECORD_API_ROUTES.DELETE.buildPath({ id })}`, () => {
      return new HttpResponse(null, { status: HTTP_STATUS_CODE.NO_CONTENT_204 })
    })
  },
  DELETE_FINANCE_RECORD_ERROR(id: number) {
    const status = HTTP_STATUS_CODE.BAD_REQUEST_400

    return http.delete(`/api${FINANCE_RECORD_API_ROUTES.DELETE.buildPath({ id })}`, () => {
      return HttpResponse.json(createTestProblemDetails({ status }), { status })
    })
  },
  GET_PAGINATED_FINANCE_RECORDS_SUCCESS(financeRecords: FinanceRecord[]) {
    return http.get(`/api${FINANCE_RECORD_API_ROUTES.GET_PAGINATED_LIST.basePath}`, () => {
      return HttpResponse.json(wrapInAPIPaginatedResponse(wrapInAPIResponse(financeRecords)))
    })
  },
  GET_PAGINATED_FINANCE_RECORDS_ERROR(detail?: string) {
    return http.get(`/api${FINANCE_RECORD_API_ROUTES.GET_PAGINATED_LIST.basePath}`, () => {
      return HttpResponse.json(createTestProblemDetails({ detail }), {
        status: HTTP_STATUS_CODE.BAD_REQUEST_400,
      })
    })
  },
}

export const FINANCE_RECORD_HANDLER_MAP: Record<
  keyof typeof FINANCE_RECORD_HANDLER_FACTORY,
  RequestHandler
> = {
  DELETE_FINANCE_RECORD_SUCCESS: FINANCE_RECORD_HANDLER_FACTORY.DELETE_FINANCE_RECORD_SUCCESS(1),
  DELETE_FINANCE_RECORD_ERROR: FINANCE_RECORD_HANDLER_FACTORY.DELETE_FINANCE_RECORD_SUCCESS(1),
  GET_PAGINATED_FINANCE_RECORDS_SUCCESS:
    FINANCE_RECORD_HANDLER_FACTORY.GET_PAGINATED_FINANCE_RECORDS_SUCCESS(
      getStubbedFinanceRecords(DEFAULT_PAGE_SIZE * 2),
    ),
  GET_PAGINATED_FINANCE_RECORDS_ERROR:
    FINANCE_RECORD_HANDLER_FACTORY.GET_PAGINATED_FINANCE_RECORDS_ERROR(),
} as const

export function setUpFinanceRecordHandlers() {
  testServer.use(...Object.values(FINANCE_RECORD_HANDLER_MAP))
}
