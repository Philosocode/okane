// Internal
import { type Tag } from '@shared/types/tag'
import { baseTestObjectFactory, type TestObjectFactoryFunction } from '@tests/factories/base'

const defaultTag: Tag = {
  id: 1,
  name: 'cool tag',
}

export const createTestTag: TestObjectFactoryFunction<Tag> = (overrides, options) => {
  return baseTestObjectFactory(defaultTag, overrides, options)
}
