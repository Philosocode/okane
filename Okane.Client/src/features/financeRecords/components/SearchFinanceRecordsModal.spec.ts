// Internal
import ModalHeading from '@shared/components/modal/ModalHeading.vue'
import SearchFinanceRecordsForm from '@features/financeRecords/components/SearchFinanceRecordsForm.vue'
import SearchFinanceRecordsModal from '@features/financeRecords/components/SearchFinanceRecordsModal.vue'

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

  return getMountComponent(SearchFinanceRecordsModal, {
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
  const form = wrapper.findComponent(SearchFinanceRecordsForm)
  expect(form.exists()).toBe(true)
})
