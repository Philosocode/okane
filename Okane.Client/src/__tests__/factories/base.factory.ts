// External
import cloneDeep from 'lodash.clonedeep'

export type StubFactoryOptions = {
  deepClone?: boolean
}

export type StubFactoryFunction<TData> = (
  overrides?: Partial<TData>,
  options?: StubFactoryOptions,
) => TData

export function baseStubFactory<TData>(
  defaultData: TData,
  overrides?: Partial<TData>,
  options?: StubFactoryOptions,
): TData {
  const dataWithOverrides = {
    ...defaultData,
    ...overrides,
  }

  if (options?.deepClone) return cloneDeep(dataWithOverrides)
  return dataWithOverrides
}
