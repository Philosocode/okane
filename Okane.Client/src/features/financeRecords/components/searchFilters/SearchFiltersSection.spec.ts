// Internal
import AppliedSearchFilters from '@features/financeRecords/components/searchFilters/AppliedSearchFilters.vue'
import ModalHeading from '@shared/components/modal/ModalHeading.vue'
import ModalTrigger from '@shared/components/modal/ModalTrigger.vue'
import SearchFiltersSection from '@features/financeRecords/components/searchFilters/SearchFiltersSection.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import { useFinanceRecordSearchStore } from '@features/financeRecords/composables/useFinanceRecordSearchStore'

import { financeUserTagHandlers } from '@tests/msw/handlers/financeUserTag'
import { testServer } from '@tests/msw/testServer'

const mountComponent = getMountComponent(SearchFiltersSection, {
  global: {
    stubs: {
      teleport: true,
    },
  },
  withPinia: true,
  withQueryClient: true,
})

beforeEach(() => {
  testServer.use(financeUserTagHandlers.getAllSuccess({ userTags: [] }))
})

test('renders the applied search filters', () => {
  const wrapper = mountComponent()
  expect(wrapper.findComponent(AppliedSearchFilters).exists()).toBe(true)
})

test('renders a modal trigger to show the search modal', async () => {
  const searchStore = useFinanceRecordSearchStore()
  const wrapper = mountComponent()

  let modalHeading = wrapper.findComponent(ModalHeading)
  expect(modalHeading.exists()).toBe(false)

  const button = wrapper.getComponent(ModalTrigger)
  expect(button.text()).toBe(FINANCES_COPY.SEARCH_FINANCE_RECORDS_MODAL.EDIT_SEARCH_FILTERS)
  expect(searchStore.modalIsShowing).toBe(false)

  await button.trigger('click')
  modalHeading = wrapper.findComponent(ModalHeading)
  expect(modalHeading.exists()).toBe(true)
  expect(searchStore.modalIsShowing).toBe(true)
})
