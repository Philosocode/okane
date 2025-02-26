// Internal
import ModalHeading from '@shared/components/modal/ModalHeading.vue'
import SearchFiltersForm from '@features/financeRecords/components/searchFilters/SearchFiltersForm.vue'
import SearchFiltersModal from '@features/financeRecords/components/searchFilters/SearchFiltersModal.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import { useFinanceRecordSearchStore } from '@features/financeRecords/composables/useFinanceRecordSearchStore'

import { commonAsserts } from '@tests/utils/commonAsserts'

const mountComponent = getMountComponent(SearchFiltersModal, {
  global: {
    stubs: {
      SearchFiltersForm: true,
      teleport: true,
    },
  },
  withPinia: true,
  withQueryClient: true,
})

beforeEach(() => {
  const searchStore = useFinanceRecordSearchStore()
  searchStore.setModalIsShowing(true)
})

test('does not render the modal content when modal is hidden', () => {
  const searchStore = useFinanceRecordSearchStore()
  searchStore.setModalIsShowing(false)

  const wrapper = mountComponent()
  const modalHeading = wrapper.findComponent(ModalHeading)
  expect(modalHeading.exists()).toBe(false)
})

test('renders the modal heading', () => {
  const wrapper = mountComponent()
  const modalHeading = wrapper.getComponent(ModalHeading)
  expect(modalHeading.text()).toBe(FINANCES_COPY.SEARCH_FINANCE_RECORDS_MODAL.EDIT_SEARCH_FILTERS)
})

test('renders an accessible modal', () => {
  const wrapper = mountComponent()
  commonAsserts.rendersAnAccessibleModal({ wrapper })
})

test('renders a form to edit finance records search filters', () => {
  const wrapper = mountComponent()
  const form = wrapper.findComponent(SearchFiltersForm)
  expect(form.exists()).toBe(true)
})
