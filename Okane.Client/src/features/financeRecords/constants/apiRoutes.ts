// Internal
import { DEFAULT_PAGE_SIZE } from '@shared/constants/request'

import {
  type FinanceRecordsSearchCursor,
  type FinanceRecordsSearchFilters,
} from '@features/financeRecords/types/searchFinanceRecords'

import { mapFinanceRecordsSearchFilters } from '@features/financeRecords/utils/mappers'

const basePath = '/finance-records'

export const financeRecordAPIRoutes = {
  getPaginatedList(args: {
    cursor: FinanceRecordsSearchCursor
    searchFilters: FinanceRecordsSearchFilters
  }) {
    const { cursor, searchFilters } = args
    const searchParams = mapFinanceRecordsSearchFilters.to.URLSearchParams(searchFilters)
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
  getStats(args: { searchFilters: FinanceRecordsSearchFilters }) {
    const searchParams = mapFinanceRecordsSearchFilters.to.URLSearchParams(args.searchFilters)
    return `${basePath}/stats?${searchParams.toString()}`
  },
  deleteFinanceRecord: ({ id }: { id: number }) => `${basePath}/${id}`,
  patchFinanceRecord: ({ id }: { id: number }) => `${basePath}/${id}`,
  postFinanceRecord: () => basePath,
} as const
