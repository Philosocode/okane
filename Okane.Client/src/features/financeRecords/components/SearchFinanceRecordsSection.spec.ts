// Internal
import SearchFinanceRecordsModal from '@features/financeRecords/components/SearchFinanceRecordsModal.vue'
import SearchFinanceRecordsSection from '@features/financeRecords/components/SearchFinanceRecordsSection.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import { useSearchFinanceRecordsStore } from '@features/financeRecords/composables/useSearchFinanceRecordsStore'

const mountComponent = getMountComponent(SearchFinanceRecordsSection)

test('renders a button to open the search filters modal', async () => {
  const wrapper = mountComponent()
  const searchStore = useSearchFinanceRecordsStore()
  searchStore.setModalIsShowing(false)

  const editButton = wrapper.findByText(
    'button',
    FINANCES_COPY.SEARCH_FINANCE_RECORDS_MODAL.EDIT_SEARCH_FILTERS,
  )
  await editButton.trigger('click')

  expect(searchStore.modalIsShowing).toBe(true)
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
