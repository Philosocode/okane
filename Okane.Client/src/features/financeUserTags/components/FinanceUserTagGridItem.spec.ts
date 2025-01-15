// Internal
import FinanceUserTagGridItem from '@features/financeUserTags/components/FinanceUserTagGridItem.vue'

import { FINANCE_USER_TAGS_COPY } from '@features/financeUserTags/constants/copy'

import { createTestFinanceUserTag } from '@tests/factories/financeUserTag'

const mountComponent = getMountComponent(FinanceUserTagGridItem)

const userTag = createTestFinanceUserTag()

test('renders the tag name', () => {
  const wrapper = mountComponent({ props: { userTag } })
  const name = wrapper.findByText('p', userTag.tag.name)
  expect(name).toBeDefined()
})

test('renders a rename button', () => {
  const wrapper = mountComponent({ props: { userTag } })
  const icon = wrapper.findByText('title', FINANCE_USER_TAGS_COPY.MANAGE_PAGE.RENAME_FINANCE_TAG)
  expect(icon).toBeDefined()
})

test('renders a delete button', () => {
  const wrapper = mountComponent({ props: { userTag } })
  const icon = wrapper.findByText('title', FINANCE_USER_TAGS_COPY.MANAGE_PAGE.DELETE_FINANCE_TAG)
  expect(icon).toBeDefined()
})
