// Internal
import AppliedSearchFilters from '@features/financeRecords/components/searchFinanceRecords/AppliedSearchFilters.vue'
import ModalHeading from '@shared/components/modal/ModalHeading.vue'
import SearchFiltersSection from '@features/financeRecords/components/searchFinanceRecords/SearchFiltersSection.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import {
  SEARCH_FINANCE_RECORDS_SYMBOL,
  useSearchFinanceRecordsProvider,
} from '@features/financeRecords/providers/searchFinanceRecordsProvider'

import { financeUserTagHandlers } from '@tests/msw/handlers/financeUserTag'
import { testServer } from '@tests/msw/testServer'

const mountComponent = getMountComponent(SearchFiltersSection, {
  global: {
    provide: {
      [SEARCH_FINANCE_RECORDS_SYMBOL]: useSearchFinanceRecordsProvider(),
    },
    stubs: {
      teleport: true,
    },
  },
  withQueryClient: true,
})

beforeEach(() => {
  testServer.use(financeUserTagHandlers.getAllSuccess({ userTags: [] }))
})

test('renders the applied search filters', () => {
  const wrapper = mountComponent()
  expect(wrapper.findComponent(AppliedSearchFilters).exists()).toBe(true)
})

test('renders a button to show the search modal', async () => {
  const provider = useSearchFinanceRecordsProvider()
  const wrapper = mountComponent({
    global: {
      provide: {
        [SEARCH_FINANCE_RECORDS_SYMBOL]: provider,
      },
    },
  })

  let modalHeading = wrapper.findComponent(ModalHeading)
  expect(modalHeading.exists()).toBe(false)

  const button = wrapper.findByText(
    'button',
    FINANCES_COPY.SEARCH_FINANCE_RECORDS_MODAL.EDIT_SEARCH_FILTERS,
  )
  await button.trigger('click')
  modalHeading = wrapper.findComponent(ModalHeading)
  expect(modalHeading.exists()).toBe(true)
})
