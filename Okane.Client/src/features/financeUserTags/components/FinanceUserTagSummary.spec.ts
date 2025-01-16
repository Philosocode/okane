// Internal
import FinanceUserTagSummary, {
  type FinanceUserTagSummaryProps,
} from '@features/financeUserTags/components/FinanceUserTagSummary.vue'

import { FINANCE_USER_TAGS_COPY } from '@features/financeUserTags/constants/copy'

import { createTestFinanceUserTag } from '@tests/factories/financeUserTag'

const mountComponent = getMountComponent(FinanceUserTagSummary)

const userTag = createTestFinanceUserTag()
const props: FinanceUserTagSummaryProps = { userTag }

test('renders the type', () => {
  const wrapper = mountComponent({ props })
  const type = wrapper.findByText(
    'p',
    `${FINANCE_USER_TAGS_COPY.MANAGE_PAGE.TYPE}: ${userTag.type}`,
  )
  expect(type).toBeDefined()
})

test('renders the name', () => {
  const wrapper = mountComponent({ props })
  const name = wrapper.findByText(
    'p',
    `${FINANCE_USER_TAGS_COPY.MANAGE_PAGE.NAME}: ${userTag.tag.name}`,
  )
  expect(name).toBeDefined()
})
