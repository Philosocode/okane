// External
import { computed, defineComponent, inject } from 'vue'

// Internal
import FinancesPage from '@shared/pages/FinancesPage.vue'

import {
  DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
  FINANCE_RECORD_SEARCH_FILTERS_KEY,
} from '@features/financeRecords/constants/searchFilters'

const testIds = {
  FinanceRecordList: 'FinanceRecordListStub',
  Heading: 'HeadingStub',
  SaveFinanceRecordForm: 'SaveFinanceRecordFormStub',
}

const mountComponent = getMountComponent(FinancesPage, {
  withQueryClient: true,
  global: {
    stubs: {
      FinanceRecordList: { template: `<div data-testid="${testIds.FinanceRecordList}" />` },
      SaveFinanceRecordForm: { template: `<div data-testid="${testIds.SaveFinanceRecordForm}" />` },
    },
  },
})

test('renders a Finances heading', () => {
  const wrapper = mountComponent()
  const mainHeading = wrapper.get('h1')

  expect(mainHeading.text()).toBe('Finances')
})

test('renders the logged in text', () => {
  const wrapper = mountComponent()
  const loggedInText = wrapper.get('p')

  expect(loggedInText.text()).toBe('You are logged in!')
})

test('renders a form to save a finance record', () => {
  const wrapper = mountComponent()
  const mockedForm = wrapper.get(`[data-testid="${testIds.SaveFinanceRecordForm}"`)

  expect(mockedForm.isVisible()).toBe(true)
})

test('renders a list of finance records', () => {
  const wrapper = mountComponent()
  const mockedList = wrapper.get(`[data-testid="${testIds.FinanceRecordList}"]`)

  expect(mockedList.isVisible()).toBe(true)
})

test('provides the search filters', () => {
  // Since FinancesPage doesn't render a slot, we'll use this instead to check that the
  // expected value is provided.
  const HeadingStub = defineComponent({
    setup() {
      const queryKey = inject(FINANCE_RECORD_SEARCH_FILTERS_KEY)
      const hashedKey = computed(() => JSON.stringify(queryKey?.value))
      return { hashedKey }
    },
    template: `<div data-testid="${testIds.Heading}">{{ hashedKey }}</div>`,
  })

  const wrapper = mountComponent({
    global: {
      stubs: {
        Heading: HeadingStub,
      },
    },
  })

  const heading = wrapper.get(`[data-testid="${testIds.Heading}"]`)
  expect(heading.text()).toBe(JSON.stringify(DEFAULT_FINANCE_RECORD_SEARCH_FILTERS))
})
