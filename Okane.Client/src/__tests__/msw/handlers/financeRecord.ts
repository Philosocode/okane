// External
import { http, HttpResponse } from 'msw'

// Internal
import { DEFAULT_FINANCE_RECORD_SEARCH_FILTERS } from '@features/financeRecords/constants/searchFinanceRecords'
import { financeRecordAPIRoutes } from '@features/financeRecords/constants/apiRoutes'
import { HTTP_STATUS_CODE } from '@shared/constants/http'

import type { FinanceRecord } from '@features/financeRecords/types/financeRecord'
import type { FinanceRecordsSearchFilters } from '@features/financeRecords/types/searchFinanceRecords'

import { createTestProblemDetails } from '@tests/factories/problemDetails'
import { getMSWURL } from '@tests/utils/url'
import { wrapInAPIPaginatedResponse, wrapInAPIResponse } from '@tests/utils/apiResponse'

export const financeRecordHandlers = {
  deleteFinanceRecordSuccess({ id }: { id: number }) {
    const url = getMSWURL(financeRecordAPIRoutes.deleteFinanceRecord({ id }))
    return http.delete(url, () => {
      return new HttpResponse(null, { status: HTTP_STATUS_CODE.NO_CONTENT_204 })
    })
  },
  deleteFinanceRecordError({ id }: { id: number }) {
    const url = getMSWURL(financeRecordAPIRoutes.deleteFinanceRecord({ id }))
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
    const url = getMSWURL(financeRecordAPIRoutes.getPaginatedList({ page: 0, searchFilters }))
    return http.get(url, () => {
      return HttpResponse.json({
        ...wrapInAPIPaginatedResponse(wrapInAPIResponse(financeRecords)),
        hasNextPage,
      })
    })
  },
  getPaginatedFinanceRecordsError({ detail }: { detail?: string }) {
    const url = getMSWURL(
      financeRecordAPIRoutes.getPaginatedList({
        page: 0,
        searchFilters: DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
      }),
    )
    return http.get(url, () => {
      return HttpResponse.json(createTestProblemDetails({ detail }), {
        status: HTTP_STATUS_CODE.BAD_REQUEST_400,
      })
    })
  },
} as const
