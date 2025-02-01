// External
import { format } from 'date-fns'

// Internal
import FinanceRecordTags from '@features/financeRecords/components/financeRecordList/FinanceRecordTags.vue'
import FinanceRecordTypePill from '@features/financeRecords/components/financeRecordList/FinanceRecordTypePill.vue'
import FinanceRecordSummary, {
  type FinanceRecordSummaryProps,
} from '@features/financeRecords/components/FinanceRecordSummary.vue'

import { COMMON_DATE_TIME_FORMAT } from '@shared/constants/dateTime'

import { createTestFinanceRecord } from '@tests/factories/financeRecord'
import { createTestTag } from '@tests/factories/tag'

const tags = [createTestTag({ id: 1, name: 'Tag 1' }), createTestTag({ id: 2, name: 'Tag 2' })]
const financeRecord = createTestFinanceRecord({ tags })
const defaultProps: FinanceRecordSummaryProps = { financeRecord }
const mountComponent = getMountComponent(FinanceRecordSummary)

test('renders the timestamp', () => {
  const wrapper = mountComponent({ props: defaultProps })
  const timestamp = wrapper.findByText(
    'p',
    format(financeRecord.happenedAt, COMMON_DATE_TIME_FORMAT),
  )
  expect(timestamp).toBeDefined()
})

test('renders the type', () => {
  const wrapper = mountComponent({ props: defaultProps })
  expect(wrapper.findComponent(FinanceRecordTypePill).exists()).toBe(true)
})

test('renders the amount', () => {
  const wrapper = mountComponent({ props: defaultProps })
  const amount = wrapper.findByText('div', financeRecord.amount.toString())
  expect(amount.exists()).toBe(true)
})

test('renders the description', () => {
  const wrapper = mountComponent({ props: defaultProps })
  const description = wrapper.findByText('p', financeRecord.description.toString())
  expect(description.exists()).toBe(true)
})

test('renders the tags', () => {
  const wrapper = mountComponent({ props: defaultProps })
  expect(wrapper.findComponent(FinanceRecordTags).exists()).toBe(true)
})
