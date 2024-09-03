// Internal
import { DEFAULT_PAGE_SIZE, INITIAL_PAGE } from '@shared/constants/request'

const basePath = '/finance-records'
const apiRoutes = {
  GET_PAGINATED_LIST: {
    basePath,
    buildPath({ page = INITIAL_PAGE }: { page: unknown }) {
      return `${basePath}?page=${page}&pageSize=${DEFAULT_PAGE_SIZE}`
    },
  },
  DELETE_FINANCE_RECORD: {
    basePath,
    buildPath({ id }: { id: number }) {
      return `${basePath}/${id}`
    },
  },
  POST_FINANCE_RECORD: {
    basePath,
    buildPath() {
      return basePath
    },
  },
} as const

export const FINANCE_RECORD_API_ROUTES = apiRoutes
