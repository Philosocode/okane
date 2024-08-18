// External
import { http, HttpResponse, RequestHandler } from 'msw'

// Internal
import { DEFAULT_PAGE_SIZE } from '@shared/constants/request.constants'
import { HTTP_STATUS_CODE } from '@shared/constants/http.constants'

import type { FinanceRecord } from '@features/financeRecords/types/financeRecord.types'

import { testServer } from '@tests/msw/testServer'

import { createStubFinanceRecord } from '@tests/factories/financeRecord.factory'
import { createStubProblemDetails } from '@tests/factories/problemDetails.factory'
import { getRange } from '@shared/utils/array.utils'
import { wrapInAPIPaginatedResponse, wrapInAPIResponse } from '@tests/factories/apiResponse.factory'

function getStubbedFinanceRecords(numRecords: number): FinanceRecord[] {
  return getRange({ end: numRecords }).map((n) =>
    createStubFinanceRecord({
      id: n,
      description: `Description ${n}`,
    }),
  )
}

export const FINANCE_RECORD_HANDLER_FACTORY = {
  GET_PAGINATED_FINANCE_RECORDS_SUCCESS(financeRecords: FinanceRecord[]) {
    return http.get('/api/finance-records', () => {
      return HttpResponse.json(wrapInAPIPaginatedResponse(wrapInAPIResponse(financeRecords)))
    })
  },
  GET_PAGINATED_FINANCE_RECORDS_ERROR(detail?: string) {
    return http.get('/api/finance-records', () => {
      return HttpResponse.json(createStubProblemDetails({ detail }), {
        status: HTTP_STATUS_CODE.BAD_REQUEST_400,
      })
    })
  },
}

export const FINANCE_RECORD_HANDLER_MAP: Record<
  keyof typeof FINANCE_RECORD_HANDLER_FACTORY,
  RequestHandler
> = {
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
