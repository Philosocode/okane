// Internal
import { DEFAULT_PAGE_SIZE, INITIAL_PAGE } from '@shared/constants/request'

const basePath = '/finance-records'

export const financeRecordAPIRoutes = {
  getPaginatedList({ page = INITIAL_PAGE }: { page: unknown }) {
    return `${basePath}?page=${page}&pageSize=${DEFAULT_PAGE_SIZE}`
  },
  deleteFinanceRecord: ({ id }: { id: number }) => `${basePath}/${id}`,
  patchFinanceRecord: ({ id }: { id: number }) => `${basePath}/${id}`,
  postFinanceRecord: () => basePath,
} as const
