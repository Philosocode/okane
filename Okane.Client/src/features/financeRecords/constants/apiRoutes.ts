// Internal
import { DEFAULT_PAGE_SIZE } from '@shared/constants/request'

import {
  type FinanceRecordSearchCursor,
  type FinanceRecordSearchFilters,
} from '@features/financeRecords/types/searchFilters'

import { mapFinanceRecordSearchFilters } from '@features/financeRecords/utils/mappers'

const basePath = '/finance-records'

export const financeRecordApiRoutes = {
  getPaginatedList(args: {
    cursor: FinanceRecordSearchCursor
    searchFilters: FinanceRecordSearchFilters
  }) {
    const { cursor, searchFilters } = args
    const searchParams = mapFinanceRecordSearchFilters.to.URLSearchParams(searchFilters)
    searchParams.append('pageSize', DEFAULT_PAGE_SIZE.toString())

    if (cursor.id) {
      searchParams.append('cursorId', cursor.id.toString())
      searchParams.delete('sortField')

      if (cursor.amount) {
        searchParams.append('cursorAmount', cursor.amount.toString())
      } else if (cursor.happenedAt) {
        searchParams.append('cursorHappenedAt', cursor.happenedAt.toString())
      }
    }

    return `${basePath}?${searchParams.toString()}`
  },
  getStats(args: { searchFilters: FinanceRecordSearchFilters; timeInterval: string }) {
    const searchParams = mapFinanceRecordSearchFilters.to.URLSearchParams(args.searchFilters)
    searchParams.append('timeInterval', args.timeInterval)
    return `${basePath}/stats?${searchParams.toString()}`
  },
  deleteFinanceRecord: ({ id }: { id: number }) => `${basePath}/${id}`,
  patchFinanceRecord: ({ id }: { id: number }) => `${basePath}/${id}`,
  postFinanceRecord: () => basePath,
} as const
