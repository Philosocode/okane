// External
import { QueryClient } from '@tanstack/vue-query'

export const testQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: Infinity,
      retry: false,
    },
  },
})
