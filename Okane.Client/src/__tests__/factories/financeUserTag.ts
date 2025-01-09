// Internal
import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'

import { baseTestObjectFactory, type TestObjectFactoryFunction } from '@tests/factories/base'
import { type FinanceUserTag } from '@features/financeUserTags/types/financeUserTag'

import { createTestTag } from '@tests/factories/tag'

const defaultFinanceUserTag: FinanceUserTag = {
  id: 1,
  tag: createTestTag(),
  type: FINANCE_RECORD_TYPE.EXPENSE,
}

export const createTestFinanceUserTag: TestObjectFactoryFunction<FinanceUserTag> = (
  overrides,
  options,
) => {
  return baseTestObjectFactory(defaultFinanceUserTag, overrides, options)
}
