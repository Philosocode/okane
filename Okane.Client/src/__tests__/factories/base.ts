// External
import cloneDeep from 'lodash.clonedeep'

export type TestObjectFactoryOptions = {
  deepClone?: boolean
}

export type TestObjectFactoryFunction<TData> = (
  overrides?: Partial<TData>,
  options?: TestObjectFactoryOptions,
) => TData

export function baseTestObjectFactory<TData>(
  defaultData: TData,
  overrides?: Partial<TData>,
  options?: TestObjectFactoryOptions,
): TData {
  const dataWithOverrides = {
    ...defaultData,
    ...overrides,
  }

  if (options?.deepClone) return cloneDeep(dataWithOverrides)
  return dataWithOverrides
}
