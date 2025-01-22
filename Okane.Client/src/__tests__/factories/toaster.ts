// Internal
import { baseTestObjectFactory, type TestObjectFactoryFunction } from '@tests/factories/base'
import { type Toast } from '@shared/types/toaster'

const defaultToast: Toast = {
  id: 1,
  text: 'Hello world',
  type: 'success',
}

export const createTestToast: TestObjectFactoryFunction<Toast> = (overrides, options) => {
  return baseTestObjectFactory(defaultToast, overrides, options)
}
