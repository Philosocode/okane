// Internal
import ModalHeading from '@shared/components/modal/ModalHeading.vue'
import SearchFiltersForm from '@features/financeRecords/components/searchFilters/SearchFiltersForm.vue'
import SearchFiltersModal from '@features/financeRecords/components/searchFilters/SearchFiltersModal.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import {
  FINANCE_RECORD_SEARCH_FILTERS_SYMBOL,
  type FinanceRecordSearchFiltersProvider,
  useFinanceRecordSearchFiltersProvider,
} from '@features/financeRecords/providers/financeRecordSearchFiltersProvider'

import { commonAsserts } from '@tests/utils/commonAsserts'

function mountWithProviders(args?: { searchProvider: FinanceRecordSearchFiltersProvider }) {
  let searchProvider = args?.searchProvider
  if (!searchProvider) {
    searchProvider = useFinanceRecordSearchFiltersProvider()
    searchProvider.setModalIsShowing(true)
  }

  return getMountComponent(SearchFiltersModal, {
    global: {
      provide: {
        [FINANCE_RECORD_SEARCH_FILTERS_SYMBOL]: searchProvider,
      },
      stubs: {
        SearchFiltersForm: true,
        teleport: true,
      },
    },
    withQueryClient: true,
  })()
}

test('does not render the modal content when modal is hidden', () => {
  const searchProvider = useFinanceRecordSearchFiltersProvider()
  searchProvider.setModalIsShowing(false)

  const wrapper = mountWithProviders({ searchProvider })
  const modalHeading = wrapper.findComponent(ModalHeading)
  expect(modalHeading.exists()).toBe(false)
})

test('renders the modal heading', () => {
  const wrapper = mountWithProviders()
  const modalHeading = wrapper.getComponent(ModalHeading)
  expect(modalHeading.text()).toBe(FINANCES_COPY.SEARCH_FINANCE_RECORDS_MODAL.EDIT_SEARCH_FILTERS)
})

test('renders an accessible modal', () => {
  const wrapper = mountWithProviders()
  commonAsserts.rendersAnAccessibleModal({ wrapper })
})

test('renders a form to edit finance records search filters', () => {
  const wrapper = mountWithProviders()
  const form = wrapper.findComponent(SearchFiltersForm)
  expect(form.exists()).toBe(true)
})
