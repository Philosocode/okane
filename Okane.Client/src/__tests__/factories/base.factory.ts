// External
import cloneDeep from 'lodash.clonedeep'

// Internal
import { HTTPStatusCode } from '@/shared/constants/http.constants'

import type { APIResponse } from '@/shared/services/apiClient/apiClient.types'

export type MockFactoryOptions = {
  deepClone?: boolean
}

export function baseMockFactory<TData>(data: TData) {
  return function createMock(overrides: Partial<TData>, options?: MockFactoryOptions): TData {
    const dataWithOverrides = {
      ...data,
      ...overrides,
    }

    if (options?.deepClone) return cloneDeep(dataWithOverrides)
    return dataWithOverrides
  }
}

export function wrapInAPIResponse<TData>(
  data: TData | TData[],
  status: number = HTTPStatusCode.Ok,
): APIResponse<TData> {
  return {
    items: Array.isArray(data) ? data : [data],
    status,
  }
}
