// External
import { http, HttpResponse } from 'msw'

// Internal
import { DEFAULT_FINANCE_RECORD_SEARCH_FILTERS } from '@features/financeRecords/constants/searchFilters'
import { financeRecordApiRoutes } from '@features/financeRecords/constants/apiRoutes'
import { HTTP_STATUS_CODE } from '@shared/constants/http'

import { type FinanceRecord } from '@features/financeRecords/types/financeRecord'
import { type FinanceRecordSearchFilters } from '@features/financeRecords/types/searchFilters'

import { createTestProblemDetails } from '@tests/factories/problemDetails'
import { getMswUrl } from '@tests/utils/url'
import { wrapInApiPaginatedResponse, wrapInApiResponse } from '@tests/utils/apiResponse'
import { DEFAULT_FINANCES_TIME_INTERVAL } from '@features/financeRecords/constants/stats'
import type { FinanceRecordsStats } from '@features/financeRecords/types/financeRecordsStats'

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
    searchFilters: FinanceRecordSearchFilters
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
        searchFilters: DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
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
  getStatsSuccess(args: { stats: FinanceRecordsStats }) {
    const url = getMswUrl(
      financeRecordApiRoutes.getStats({
        searchFilters: DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
        timeInterval: DEFAULT_FINANCES_TIME_INTERVAL,
      }),
    )
    return http.get(url, () => {
      return HttpResponse.json(wrapInApiResponse(args.stats))
    })
  },
  getStatsError() {
    const url = getMswUrl(
      financeRecordApiRoutes.getStats({
        searchFilters: DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
        timeInterval: DEFAULT_FINANCES_TIME_INTERVAL,
      }),
    )
    const status = HTTP_STATUS_CODE.BAD_REQUEST_400

    return http.get(url, () => {
      return HttpResponse.json(createTestProblemDetails({ status }), { status })
    })
  },
} as const
