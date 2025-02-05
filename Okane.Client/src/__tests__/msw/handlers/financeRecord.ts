// External
import { http, HttpResponse } from 'msw'

// Internal
import { DEFAULT_FINANCE_RECORDS_SEARCH_FILTERS } from '@features/financeRecords/constants/searchFinanceRecords'
import { financeRecordApiRoutes } from '@features/financeRecords/constants/apiRoutes'
import { HTTP_STATUS_CODE } from '@shared/constants/http'

import { type FinanceRecord } from '@features/financeRecords/types/financeRecord'
import { type FinanceRecordsSearchFilters } from '@features/financeRecords/types/searchFinanceRecords'

import { createTestProblemDetails } from '@tests/factories/problemDetails'
import { getMswUrl } from '@tests/utils/url'
import { wrapInApiPaginatedResponse, wrapInApiResponse } from '@tests/utils/apiResponse'

export const financeRecordHandlers = {
  deleteFinanceRecordSuccess(args: { id: number }) {
    const url = getMswUrl(financeRecordApiRoutes.deleteFinanceRecord({ id: args.id }))
    return http.delete(url, () => {
      return new HttpResponse(null, { status: HTTP_STATUS_CODE.NO_CONTENT_204 })
    })
  },
  deleteFinanceRecordError(args: { id: number }) {
    const url = getMswUrl(financeRecordApiRoutes.deleteFinanceRecord({ id: args.id }))
    const status = HTTP_STATUS_CODE.BAD_REQUEST_400

    return http.delete(url, () => {
      return HttpResponse.json(createTestProblemDetails({ status }), { status })
    })
  },
  getPaginatedFinanceRecordsSuccess({
    financeRecords,
    searchFilters,
    hasNextPage = true,
  }: {
    financeRecords: FinanceRecord[]
    searchFilters: FinanceRecordsSearchFilters
    hasNextPage?: boolean
  }) {
    const url = getMswUrl(
      financeRecordApiRoutes.getPaginatedList({
        cursor: {},
        searchFilters,
      }),
    )
    return http.get(url, () => {
      return HttpResponse.json({
        ...wrapInApiPaginatedResponse(wrapInApiResponse(financeRecords)),
        hasNextPage,
      })
    })
  },
  getPaginatedFinanceRecordsError(args: { detail?: string }) {
    const url = getMswUrl(
      financeRecordApiRoutes.getPaginatedList({
        cursor: {},
        searchFilters: DEFAULT_FINANCE_RECORDS_SEARCH_FILTERS,
      }),
    )
    return http.get(url, () => {
      return HttpResponse.json(
        createTestProblemDetails({
          detail: args.detail,
        }),
        {
          status: HTTP_STATUS_CODE.BAD_REQUEST_400,
        },
      )
    })
  },
} as const
