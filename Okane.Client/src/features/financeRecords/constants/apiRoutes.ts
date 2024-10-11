// Internal
import { DEFAULT_PAGE_SIZE, INITIAL_PAGE } from '@shared/constants/request'

import { type FinanceRecordsSearchFilters } from '@features/financeRecords/types/searchFinanceRecords'

import { mapFinanceRecordsSearchFilters } from '@features/financeRecords/utils/mappers'

const basePath = '/finance-records'

export const financeRecordAPIRoutes = {
  getPaginatedList({
    page = INITIAL_PAGE,
    searchFilters,
  }: {
    page: unknown
    searchFilters: FinanceRecordsSearchFilters
  }) {
    const searchParams = mapFinanceRecordsSearchFilters.to.URLSearchParams(searchFilters)
    searchParams.append('page', `${page}`)
    searchParams.append('pageSize', DEFAULT_PAGE_SIZE.toString())

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
