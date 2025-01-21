// Internal
import { HTTP_STATUS_CODE } from '@shared/constants/http'

import { type APIPaginatedResponse, type APIResponse } from '@shared/services/apiClient/types'

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
  return {
    hasNextPage: true,
    ...response,
    ...overrides,
  }
}
