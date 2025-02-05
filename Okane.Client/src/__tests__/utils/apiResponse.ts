// Internal
import { HTTP_STATUS_CODE } from '@shared/constants/http'

import { type ApiPaginatedResponse, type ApiResponse } from '@shared/services/apiClient/types'

export function wrapInApiResponse<TData>(
  data: TData | TData[],
  status: number = HTTP_STATUS_CODE.OK_200,
): ApiResponse<TData> {
  return {
    items: Array.isArray(data) ? data : [data],
    status,
  }
}

export function wrapInApiPaginatedResponse<TData>(
  response: ApiResponse<TData>,
  overrides?: Partial<ApiPaginatedResponse<TData>>,
): ApiPaginatedResponse<TData> {
  return {
    hasNextPage: true,
    ...response,
    ...overrides,
  }
}
