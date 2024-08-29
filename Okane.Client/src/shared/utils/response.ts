// Internal
import type { APIPaginatedResponse } from '@shared/services/apiClient/types'

export function flattenPages<T>(pages?: APIPaginatedResponse<T>[]) {
  return pages?.flatMap((page) => page.items) ?? []
}
