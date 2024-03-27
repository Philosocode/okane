// Internal
import { HTTP_STATUS_CODE } from '@shared/constants/http.constants'

import type { APIResponse } from '@shared/services/apiClient/apiClient.types'

export function wrapInAPIResponse<TData>(
  data: TData | TData[],
  status: number = HTTP_STATUS_CODE.OK_200,
): APIResponse<TData> {
  return {
    items: Array.isArray(data) ? data : [data],
    status,
  }
}
