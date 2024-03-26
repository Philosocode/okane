// External
import cloneDeep from 'lodash.clonedeep'

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
