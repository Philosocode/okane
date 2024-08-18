// Internal
import { HTTP_STATUS_CODE } from '@shared/constants/http.constants'

import type { APIPaginatedResponse, APIResponse } from '@shared/services/apiClient/apiClient.types'

export function wrapInAPIResponse<TData>(
  data: TData | TData[],
  status: number = HTTP_STATUS_CODE.OK_200,
): APIResponse<TData> {
  return {
    items: Array.isArray(data) ? data : [data],
    status,
  }
}

export function wrapInAPIPaginatedResponse<TData>(
  response: APIResponse<TData>,
  overrides?: Partial<APIPaginatedResponse<TData>>,
): APIPaginatedResponse<TData> {
  const pageSize = response.items.length

  return {
    hasNextPage: true,
    pageSize,
    currentPage: 1,
    totalItems: pageSize * 10,
    ...response,
    ...overrides,
  }
}
