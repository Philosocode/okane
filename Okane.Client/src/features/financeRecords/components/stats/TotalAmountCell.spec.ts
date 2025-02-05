// Internal
import TotalAmountCell, {
  type TotalAmountCellProps,
} from '@features/financeRecords/components/stats/TotalAmountCell.vue'

import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

const mountComponent = getMountComponent(TotalAmountCell)

const props: TotalAmountCellProps = {
  amount: 1000,
  count: 5,
  headingText: 'Revenue',
  loading: false,
  type: FINANCE_RECORD_TYPE.REVENUE,
}

test('renders the heading', () => {
  const wrapper = mountComponent({ props })
  expect(wrapper.findByText('h3', props.headingText)).toBeDefined()
})

test('renders the amount', () => {
  const wrapper = mountComponent({ props })
  const expectedText = FINANCES_COPY.STATS.TOTAL_AMOUNT({ amount: props.amount, type: props.type })
  expect(wrapper.findByText('p', expectedText)).toBeDefined()
})

test('renders the records count', () => {
  let wrapper = mountComponent({ props })
  expect(wrapper.findByText('p', `${props.count} ${FINANCES_COPY.STATS.RECORD}s`)).toBeDefined()

  wrapper = mountComponent({
    props: {
      ...props,
      count: 1,
    },
  })
  expect(wrapper.findByText('p', `1 ${FINANCES_COPY.STATS.RECORD}`)).toBeDefined()
})
