// Internal
import { DEFAULT_PAGE_SIZE } from '@shared/constants/request'

const apiRoutes = {
  GET_PAGINATED_LIST: {
    basePath: '/finance-records',
    buildPath({ page }: { page: unknown }) {
      return `${apiRoutes.GET_PAGINATED_LIST.basePath}?page=${page}&pageSize=${DEFAULT_PAGE_SIZE}`
    },
  },
} as const

export const FINANCE_RECORD_API_ROUTES = apiRoutes
