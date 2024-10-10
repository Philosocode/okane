// Internal
import SearchFinanceRecordsModal from '@features/financeRecords/components/SearchFinanceRecordsModal.vue'
import SearchFinanceRecordsSection from '@features/financeRecords/components/SearchFinanceRecordsSection.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import {
  SEARCH_FINANCE_RECORDS_SYMBOL,
  useSearchFinanceRecordsProvider,
} from '@features/financeRecords/providers/searchFinanceRecordsProvider'

const mountComponent = getMountComponent(SearchFinanceRecordsSection, {
  global: {
    provide: {
      [SEARCH_FINANCE_RECORDS_SYMBOL]: useSearchFinanceRecordsProvider(),
    },
  },
})

test('renders a button to open the search filters modal', async () => {
  const searchProvider = useSearchFinanceRecordsProvider()
  searchProvider.setModalIsShowing(false)

  const wrapper = mountComponent({
    global: {
      provide: {
        [SEARCH_FINANCE_RECORDS_SYMBOL]: searchProvider,
      },
    },
  })
  const editButton = wrapper.findByText(
    'button',
    FINANCES_COPY.SEARCH_FINANCE_RECORDS_MODAL.EDIT_SEARCH_FILTERS,
  )
  await editButton.trigger('click')

  expect(searchProvider.modalIsShowing).toBe(true)
})

test('renders a modal to edit search filters', () => {
  const wrapper = mountComponent()
  const modal = wrapper.findComponent(SearchFinanceRecordsModal)
  expect(modal.exists()).toBe(true)
})

test('renders a summary of applied search filters', () => {
  const wrapper = mountComponent()
  const summary = wrapper.findComponent(SearchFinanceRecordsSection)
  expect(summary.exists()).toBe(true)
})
