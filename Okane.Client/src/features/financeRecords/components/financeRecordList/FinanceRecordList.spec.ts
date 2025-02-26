// External
import { flushPromises } from '@vue/test-utils'

// Internal
import FinanceRecordList from '@features/financeRecords/components/financeRecordList/FinanceRecordList.vue'

import { DEFAULT_FINANCE_RECORD_SEARCH_FILTERS } from '@features/financeRecords/constants/searchFilters'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { financeRecordHandlers } from '@tests/msw/handlers/financeRecord'
import { SHARED_COPY } from '@shared/constants/copy'

import {
  DELETE_FINANCE_RECORD_SYMBOL,
  useDeleteFinanceRecordProvider,
} from '@features/financeRecords/providers/deleteFinanceRecordProvider'
import {
  SAVE_FINANCE_RECORD_SYMBOL,
  useSaveFinanceRecordProvider,
} from '@features/financeRecords/providers/saveFinanceRecordProvider'

import { getRange } from '@shared/utils/array'

import { createTestFinanceRecord } from '@tests/factories/financeRecord'
import { testServer } from '@tests/msw/testServer'

const financeRecords = getRange({ end: 5 }).map((n) =>
  createTestFinanceRecord({
    id: n,
    description: `Description ${n}`,
  }),
)

const mountComponent = getMountComponent(FinanceRecordList, {
  global: {
    provide: {
      // Needed for FinanceRecordListItem.
      [DELETE_FINANCE_RECORD_SYMBOL]: useDeleteFinanceRecordProvider(),
      [SAVE_FINANCE_RECORD_SYMBOL]: useSaveFinanceRecordProvider(),
    },
    stubs: {
      Observer: true,
      teleport: true,
    },
  },
  withQueryClient: true,
})

test('renders a list of finance records', async () => {
  testServer.use(
    financeRecordHandlers.getPaginatedFinanceRecordsSuccess({
      financeRecords,
      hasNextPage: false,
      searchFilters: DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
    }),
  )

  const wrapper = mountComponent()

  await flushPromises()

  financeRecords.forEach((financeRecord) => {
    const description = wrapper.findByText('div', financeRecord.description)
    expect(description.exists()).toBe(true)
  })

  const noFinanceRecords = wrapper.findByText('p', FINANCES_COPY.INFINITE_LIST.NO_FINANCE_RECORDS)
  expect(noFinanceRecords).toBeUndefined()

  const reachedTheBottom = wrapper.findByText('p', SHARED_COPY.INFINITE_SCROLLER.REACHED_THE_BOTTOM)
  expect(reachedTheBottom).toBeDefined()
})

test('renders the expected message if no records exist', async () => {
  testServer.use(
    financeRecordHandlers.getPaginatedFinanceRecordsSuccess({
      financeRecords: [],
      searchFilters: DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
    }),
  )

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

  const noFinanceRecords = wrapper.findByText('p', FINANCES_COPY.INFINITE_LIST.NO_FINANCE_RECORDS)
  expect(noFinanceRecords).toBeDefined()
})
