// Internal
import { DEFAULT_PAGE_SIZE, INITIAL_PAGE } from '@shared/constants/request'

const basePath = '/finance-records'

// TODO: Update basePath to also be a function...
export const financeRecordAPIRoutes = {
  getPaginatedList: {
    basePath,
    buildPath({ page = INITIAL_PAGE }: { page: unknown }) {
      return `${basePath}?page=${page}&pageSize=${DEFAULT_PAGE_SIZE}`
    },
  },
  deleteFinanceRecord: {
    basePath,
    buildPath({ id }: { id: number }) {
      return `${basePath}/${id}`
    },
  },
  patchFinanceRecord: {
    basePath,
    buildPath({ id }: { id: number }) {
      return `${basePath}/${id}`
    },
  },
  postFinanceRecord: {
    basePath,
    buildPath() {
      return basePath
    },
  },
} as const
