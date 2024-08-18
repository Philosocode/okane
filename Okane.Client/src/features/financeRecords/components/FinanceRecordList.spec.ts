// External
import { flushPromises } from '@vue/test-utils'

// Internal
import FinanceRecordList from '@features/financeRecords/components/FinanceRecordList.vue'

import { testServer } from '@tests/msw/testServer'

import { FINANCE_RECORD_HANDLER_FACTORY } from '@tests/msw/handlers/financeRecord.handlers'

import { createStubFinanceRecord } from '@tests/factories/financeRecord.factory'
import { getRange } from '@shared/utils/array.utils'

const financeRecords = getRange({ end: 5 }).map((n) =>
  createStubFinanceRecord({
    id: n,
    description: `Description ${n}`,
  }),
)

const mountComponent = getMountComponent(FinanceRecordList, {
  global: { stubs: { Observer: true } },
  withQueryClient: true,
})

const noFinanceRecordsText = "No finance records. Why don't you create one?"

test('renders a list of finance records', async () => {
  testServer.use(
    FINANCE_RECORD_HANDLER_FACTORY.GET_PAGINATED_FINANCE_RECORDS_SUCCESS(financeRecords),
  )

  const wrapper = mountComponent()

  await flushPromises()

  financeRecords.forEach((financeRecord) => {
    const description = wrapper.findByText('div', financeRecord.description)
    expect(description.exists()).toBe(true)
  })

  const noFinanceRecords = wrapper.findByText('p', noFinanceRecordsText)
  expect(noFinanceRecords).toBeUndefined()
})

test('renders the expected message if no records exist', async () => {
  testServer.use(FINANCE_RECORD_HANDLER_FACTORY.GET_PAGINATED_FINANCE_RECORDS_SUCCESS([]))

  const testId = 'FinanceRecordListItem'

  const wrapper = mountComponent({
    global: {
      stubs: {
        FinanceRecordListItem: {
          template: `<div data-testid="${testId}" />`,
        },
      },
    },
  })

  await flushPromises()

  const listItem = wrapper.find(`[data-testid="${testId}"]`)
  expect(listItem.exists()).toBe(false)

  const noFinanceRecords = wrapper.findByText('p', noFinanceRecordsText)
  expect(noFinanceRecords).toBeDefined()
})
