// External
import { flushPromises } from '@vue/test-utils'
import { toRef } from 'vue'

// Internal
import DeleteFinanceRecordModal from '@features/financeRecords/components/DeleteFinanceRecordModal.vue'
import FinanceRecordList from '@features/financeRecords/components/FinanceRecordList.vue'
import ModalHeading from '@shared/components/modal/ModalHeading.vue'
import ToggleMenu from '@shared/components/ToggleMenu.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { FINANCE_RECORD_HANDLER_FACTORY } from '@tests/msw/handlers/financeRecord'
import { SHARED_COPY } from '@shared/constants/copy'
import {
  DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
  FINANCE_RECORD_SEARCH_FILTERS_KEY,
} from '@features/financeRecords/constants/searchFilters'

import { testServer } from '@tests/msw/testServer'

import { getRange } from '@shared/utils/array'

import { createTestFinanceRecord } from '@tests/factories/financeRecord'

const financeRecords = getRange({ end: 5 }).map((n) =>
  createTestFinanceRecord({
    id: n,
    description: `Description ${n}`,
  }),
)

const mountComponent = getMountComponent(FinanceRecordList, {
  global: {
    provide: {
      [FINANCE_RECORD_SEARCH_FILTERS_KEY as symbol]: toRef(DEFAULT_FINANCE_RECORD_SEARCH_FILTERS),
    },
    stubs: { Observer: true, teleport: true },
  },
  withQueryClient: true,
})

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

  const noFinanceRecords = wrapper.findByText('p', FINANCES_COPY.INFINITE_LIST.NO_FINANCE_RECORDS)
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

  const noFinanceRecords = wrapper.findByText('p', FINANCES_COPY.INFINITE_LIST.NO_FINANCE_RECORDS)
  expect(noFinanceRecords).toBeDefined()
})

test('opens the delete modal when choosing the delete option', async () => {
  const financeRecord = createTestFinanceRecord()
  testServer.use(
    FINANCE_RECORD_HANDLER_FACTORY.GET_PAGINATED_FINANCE_RECORDS_SUCCESS([financeRecord]),
  )
  const wrapper = mountComponent()
  await flushPromises()

  const menu = wrapper.getComponent(ToggleMenu)
  const menuToggle = menu.get('button')
  await menuToggle.trigger('click')

  function getDeleteModalHeading() {
    return wrapper.getComponent(DeleteFinanceRecordModal).findComponent(ModalHeading)
  }

  expect(getDeleteModalHeading().exists()).toBe(false)

  const deleteOption = wrapper.findByText('button', SHARED_COPY.ACTIONS.DELETE)
  await deleteOption.trigger('click')
  expect(getDeleteModalHeading().exists()).toBe(true)
})
