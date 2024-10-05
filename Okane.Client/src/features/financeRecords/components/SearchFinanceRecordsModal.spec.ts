// Internal
import ModalHeading from '@shared/components/modal/ModalHeading.vue'
import SearchFinanceRecordsForm from '@features/financeRecords/components/SearchFinanceRecordsForm.vue'
import SearchFinanceRecordsModal from '@features/financeRecords/components/SearchFinanceRecordsModal.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import { useSearchFinanceRecordsStore } from '@features/financeRecords/composables/useSearchFinanceRecordsStore'

import { commonAsserts } from '@tests/utils/commonAsserts'

const mountComponent = getMountComponent(SearchFinanceRecordsModal, {
  global: {
    stubs: {
      teleport: true,
    },
  },
})

beforeEach(() => {
  const searchStore = useSearchFinanceRecordsStore()
  searchStore.setModalIsShowing(true)
})

test('renders the modal heading', () => {
  const wrapper = mountComponent()
  const modalHeading = wrapper.getComponent(ModalHeading)
  expect(modalHeading.text()).toBe(FINANCES_COPY.SEARCH_FINANCE_RECORDS_MODAL.EDIT_SEARCH_FILTERS)
})

test('renders an accessible dialog', () => {
  const wrapper = mountComponent()
  commonAsserts.rendersAnAccessibleDialog({ dialog: wrapper.get('dialog') })
})

test('renders a form to edit finance records search filters', () => {
  const wrapper = mountComponent()
  const form = wrapper.findComponent(SearchFinanceRecordsForm)
  expect(form.exists()).toBe(true)
})

describe('when the modal is hidden', () => {
  test('does not render the modal content', () => {
    const searchStore = useSearchFinanceRecordsStore()
    searchStore.setModalIsShowing(false)

    const wrapper = mountComponent()
    const modalHeading = wrapper.findComponent(ModalHeading)
    expect(modalHeading.exists()).toBe(false)
  })
})
