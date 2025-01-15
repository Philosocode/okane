// External
import { flushPromises } from '@vue/test-utils'

import { type Router } from 'vue-router'

// Internal
import SearchFinanceRecordsModal from '@features/financeRecords/components/SearchFinanceRecordsModal.vue'
import SearchFinanceRecordsSection from '@features/financeRecords/components/SearchFinanceRecordsSection.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import {
  SEARCH_FINANCE_RECORDS_SYMBOL,
  useSearchFinanceRecordsProvider,
  type SearchFinanceRecordsProvider,
} from '@features/financeRecords/providers/searchFinanceRecordsProvider'

import { createAppRouter, ROUTE_NAME } from '@shared/services/router/router'

import { financeUserTagHandlers } from '@tests/msw/handlers/financeUserTag'
import { testServer } from '@tests/msw/testServer'

function mountComponent(
  args: { router?: Router; searchProvider?: SearchFinanceRecordsProvider } = {},
) {
  testServer.use(financeUserTagHandlers.getAllSuccess({ userTags: [] }))

  return getMountComponent(SearchFinanceRecordsSection, {
    global: {
      provide: {
        [SEARCH_FINANCE_RECORDS_SYMBOL]: args.searchProvider ?? useSearchFinanceRecordsProvider(),
      },
    },
    withQueryClient: true,
    withRouter: args.router ?? true,
  })()
}

test('renders a button to open the search filters modal', async () => {
  const searchProvider = useSearchFinanceRecordsProvider()
  searchProvider.setModalIsShowing(false)

  const wrapper = mountComponent({ searchProvider })
  const editButton = wrapper.findByText(
    'button',
    FINANCES_COPY.SEARCH_FINANCE_RECORDS_MODAL.EDIT_SEARCH_FILTERS,
  )
  await editButton.trigger('click')

  expect(searchProvider.modalIsShowing).toBe(true)
})

test('renders a button that links to the manage finance tags page', async () => {
  const router = createAppRouter()
  const wrapper = mountComponent({ router })
  const button = wrapper.findByText('button', FINANCES_COPY.MANAGE_TAGS)
  await button.trigger('click')
  await flushPromises()
  expect(router.currentRoute.value.name).toBe(ROUTE_NAME.MANAGE_FINANCE_TAGS)
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
