// Internal
import AppliedAmountFilter, {
  type AppliedAmountFilterProps,
} from '@features/financeRecords/components/searchFilters/AppliedAmountFilter.vue'

import { COMPARISON_OPERATOR } from '@shared/constants/search'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

const mountComponent = getMountComponent(AppliedAmountFilter)

test('renders nothing if not filtering by amount', () => {
  const wrapper = mountComponent()
  expect(wrapper.find('li').exists()).toBe(false)
})

test('renders the expected text for an amount and an operator', () => {
  const props: AppliedAmountFilterProps = { amount1: 1, amountOperator: COMPARISON_OPERATOR.EQUAL }
  const wrapper = mountComponent({ props })
  const lis = wrapper.findAllByText(
    'li',
    FINANCES_COPY.SEARCH_FILTERS.APPLIED_AMOUNT_AND_OPERATOR({
      amount: props.amount1!,
      operator: props.amountOperator!,
    }),
  )
  expect(lis).toHaveLength(1)
})

test('renders the expected text for an amount range', () => {
  const props: AppliedAmountFilterProps = { amount1: 1, amount2: 2 }
  const wrapper = mountComponent({ props })
  const lis = wrapper.findAllByText(
    'li',
    FINANCES_COPY.SEARCH_FILTERS.APPLIED_AMOUNT_RANGE({
      amount1: props.amount1!,
      amount2: props.amount2!,
    }),
  )
  expect(lis).toHaveLength(1)
})
