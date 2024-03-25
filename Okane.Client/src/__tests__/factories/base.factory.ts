// External
import cloneDeep from 'lodash.clonedeep'

// Internal
import { HTTP_STATUS_CODE } from '@/shared/constants/http.constants'

import type { APIResponse } from '@/shared/services/apiClient/apiClient.types'

export type MockFactoryOptions = {
  deepClone?: boolean
}

export type MockFactoryFunction<TData> = (
  overrides?: Partial<TData>,
  options?: MockFactoryOptions,
) => TData

export function baseMockFactory<TData>(
  defaultData: TData,
  overrides?: Partial<TData>,
  options?: MockFactoryOptions,
): TData {
  const dataWithOverrides = {
    ...defaultData,
    ...overrides,
  }

  if (options?.deepClone) return cloneDeep(dataWithOverrides)
  return dataWithOverrides
}

export function wrapInAPIResponse<TData>(
  data: TData | TData[],
  status: number = HTTP_STATUS_CODE.OK,
): APIResponse<TData> {
  return {
    items: Array.isArray(data) ? data : [data],
    status,
  }
}
