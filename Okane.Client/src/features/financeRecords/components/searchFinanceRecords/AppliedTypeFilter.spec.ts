// Internal
import AppliedTypeFilter, {
  type AppliedTypeFilterProps,
} from '@features/financeRecords/components/searchFinanceRecords/AppliedTypeFilter.vue'

import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

const mountComponent = getMountComponent(AppliedTypeFilter)

test('renders nothing if not filtering by type', () => {
  const props: AppliedTypeFilterProps = { type: '' }
  const wrapper = mountComponent({ props })
  expect(wrapper.find('li').exists()).toBe(false)
})

test('renders the type', () => {
  const type = FINANCE_RECORD_TYPE.EXPENSE
  const props: AppliedTypeFilterProps = { type }
  const wrapper = mountComponent({ props })
  const lis = wrapper.findAllByText(
    'li',
    FINANCES_COPY.SEARCH_FILTERS.APPLIED_TYPE({
      type,
    }),
  )
  expect(lis).toHaveLength(1)
})
