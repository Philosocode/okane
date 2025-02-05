// Internal
import AppliedHappenedAtFilter, {
  type AppliedHappenedAtFilterProps,
} from '@features/financeRecords/components/searchFilters/AppliedHappenedAtFilter.vue'

import { COMPARISON_OPERATOR } from '@shared/constants/search'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

const mountComponent = getMountComponent(AppliedHappenedAtFilter)

test('renders nothing if not filtering by happenedAt', () => {
  const props: AppliedHappenedAtFilterProps = {}
  const wrapper = mountComponent({ props })
  expect(wrapper.find('li').exists()).toBe(false)
})

test('renders the expected text for a date and an operator', () => {
  const happenedAt1 = new Date()
  const happenedAtOperator = COMPARISON_OPERATOR.EQUAL
  const props: AppliedHappenedAtFilterProps = { happenedAt1, happenedAtOperator }
  const wrapper = mountComponent({ props })
  const lis = wrapper.findAllByText(
    'li',
    FINANCES_COPY.SEARCH_FILTERS.APPLIED_HAPPENED_AT_AND_OPERATOR({
      happenedAt: happenedAt1,
      operator: happenedAtOperator,
    }),
  )
  expect(lis).toHaveLength(1)
})

test('renders the expected text for an amount range', () => {
  const date = new Date()
  const props: AppliedHappenedAtFilterProps = {
    happenedAt1: date,
    happenedAt2: date,
  }
  const wrapper = mountComponent({ props })
  const lis = wrapper.findAllByText(
    'li',
    FINANCES_COPY.SEARCH_FILTERS.APPLIED_HAPPENED_AT_RANGE({
      happenedAt1: date,
      happenedAt2: date,
    }),
  )
  expect(lis).toHaveLength(1)
})
