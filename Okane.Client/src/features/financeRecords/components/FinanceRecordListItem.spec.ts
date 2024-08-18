// External
import { formatDate } from 'date-fns'

// Internal
import FinanceRecordListItem from '@features/financeRecords/components/FinanceRecordListItem.vue'

import { createStubFinanceRecord } from '@tests/factories/financeRecord.factory'

const financeRecord = createStubFinanceRecord()
const mountComponent = getMountComponent(FinanceRecordListItem, {
  props: { financeRecord },
})

test('renders the type', () => {
  const wrapper = mountComponent()
  const type = wrapper.findByText('span', financeRecord.type)

  expect(type.exists()).toBe(true)
})

test('renders the amount', () => {
  const wrapper = mountComponent()
  const amount = wrapper.findByText('div', financeRecord.amount.toString())

  expect(amount.exists()).toBe(true)
})

test('renders the type and timestamp', () => {
  const expectedTimestamp = formatDate(financeRecord.happenedAt, 'MM/dd/yyyy @ k:mm a')
  const wrapper = mountComponent()
  const topRow = wrapper.get('.top-row')

  expect(topRow.text()).toBe(`${financeRecord.type} - ${expectedTimestamp}`)
})

test('renders the description', () => {
  const wrapper = mountComponent()
  const description = wrapper.findByText('div', financeRecord.description.toString())

  expect(description.exists()).toBe(true)
})
