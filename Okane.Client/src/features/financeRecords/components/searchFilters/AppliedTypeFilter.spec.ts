// Internal
import AppliedTypeFilter, {
  type AppliedTypeFilterProps,
} from '@features/financeRecords/components/searchFilters/AppliedTypeFilter.vue'

import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'
import { FINANCES_SEARCH_FILTERS_COPY } from '@features/financeRecords/constants/searchFiltersCopy'

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
    FINANCES_SEARCH_FILTERS_COPY.APPLIED_TYPE({
      type,
    }),
  )
  expect(lis).toHaveLength(1)
})
