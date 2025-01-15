// Internal
import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'

import { useManageFinanceUserTagsProvider } from '@features/financeUserTags/providers/manageFinanceUserTagsProvider'

import { createTestFinanceUserTag } from '@tests/factories/financeUserTag'

test('returns a user tag to delete and setter', () => {
  const provider = useManageFinanceUserTagsProvider()
  const userTag = createTestFinanceUserTag()
  provider.setUserTagToDelete(userTag)
  expect(provider.userTagToDelete).toEqual(userTag)
})

test('returns a user tag to rename and setter', () => {
  const provider = useManageFinanceUserTagsProvider()
  const userTag = createTestFinanceUserTag()
  provider.setUserTagToRename(userTag)
  expect(provider.userTagToRename).toEqual(userTag)
})

test('returns a user tag type and setter', () => {
  const provider = useManageFinanceUserTagsProvider()
  const type = FINANCE_RECORD_TYPE.REVENUE
  provider.setUserTagType(type)
  expect(provider.userTagType).toEqual(type)
})
