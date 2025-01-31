// Internal
import ModalHeading from '@shared/components/modal/ModalHeading.vue'
import SearchFiltersForm from '@features/financeRecords/components/searchFinanceRecords/SearchFiltersForm.vue'
import SearchFiltersModal from '@features/financeRecords/components/searchFinanceRecords/SearchFiltersModal.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import {
  SEARCH_FINANCE_RECORDS_SYMBOL,
  type SearchFinanceRecordsProvider,
  useSearchFinanceRecordsProvider,
} from '@features/financeRecords/providers/searchFinanceRecordsProvider'

import { commonAsserts } from '@tests/utils/commonAsserts'

function mountWithProviders(args?: { searchProvider: SearchFinanceRecordsProvider }) {
  let searchProvider = args?.searchProvider
  if (!searchProvider) {
    searchProvider = useSearchFinanceRecordsProvider()
    searchProvider.setModalIsShowing(true)
  }

  return getMountComponent(SearchFiltersModal, {
    global: {
      provide: {
        [SEARCH_FINANCE_RECORDS_SYMBOL]: searchProvider,
      },
      stubs: {
        SearchFinanceRecordsForm: true,
        teleport: true,
      },
    },
    withQueryClient: true,
  })()
}

test('does not render the modal content when modal is hidden', () => {
  const searchProvider = useSearchFinanceRecordsProvider()
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
