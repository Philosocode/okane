// Internal
import TotalAmountCell from '@features/financeRecords/components/TotalAmountCell.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

const mountComponent = getMountComponent(TotalAmountCell)

const props = {
  amount: 1000,
  count: 5,
  headingText: 'Revenue',
}

test('renders the heading', () => {
  const wrapper = mountComponent({ props })
  expect(wrapper.findByText('h4', props.headingText)).toBeDefined()
})

test('renders the amount', () => {
  const wrapper = mountComponent({ props })
  expect(wrapper.findByText('p', `$${props.amount}.00`)).toBeDefined()
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
