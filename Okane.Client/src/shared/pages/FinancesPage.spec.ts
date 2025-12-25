// External
import { flushPromises, type VueWrapper } from '@vue/test-utils'
import { defineComponent, inject, ref } from 'vue'

// Internal
import ErrorMessage from '@shared/components/typography/ErrorMessage.vue'
import FinancesPage from '@shared/pages/FinancesPage.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import * as deleteFinanceRecordProvider from '@features/financeRecords/providers/deleteFinanceRecordProvider'
import * as saveFinanceRecordProvider from '@features/financeRecords/providers/saveFinanceRecordProvider'
import * as useWatchFinanceQueryParams from '@features/financeRecords/composables/useWatchFinanceQueryParams'

import { commonAsserts } from '@tests/utils/commonAsserts'
import { createTestFinanceRecord } from '@tests/factories/financeRecord'

import { financeUserTagHandlers } from '@tests/msw/handlers/financeUserTag'
import { testServer } from '@tests/msw/testServer'

const testIds = {
  CreateFinanceRecordButton: 'CreateFinanceRecordButton',
  CreateFinanceRecordModal: 'CreateFinanceRecordModal',
  DeleteFinanceRecordModal: 'DeleteFinanceRecordModal',
  EditFinanceRecordModal: 'EditFinanceRecordModal',
  FinanceCharts: 'FinanceCharts',
  FinanceRecordList: 'FinanceRecordList',
  Heading: 'Heading',
  TotalRevenuesAndExpenses: 'TotalRevenuesAndExpenses',
  SearchFiltersSection: 'SearchFiltersSection',
}

async function mountComponent({
  shouldFlushPromises = true,
  stubOverrides = {},
  tagsHandler = financeUserTagHandlers.getAllSuccess({ userTags: [] }),
} = {}) {
  testServer.use(tagsHandler)

  const wrapper = getMountComponent(FinancesPage, {
    withQueryClient: true,
    withRouter: true,
    global: {
      stubs: {
        CreateFinanceRecordButton: {
          template: `<div data-testid="${testIds.CreateFinanceRecordButton}" />`,
        },
        CreateFinanceRecordModal: {
          template: `<div data-testid="${testIds.CreateFinanceRecordModal}" />`,
        },
        DeleteFinanceRecordModal: {
          template: `<div data-testid="${testIds.DeleteFinanceRecordModal}" />`,
        },
        EditFinanceRecordModal: {
          template: `<div data-testid="${testIds.EditFinanceRecordModal}" />`,
        },
        FinanceCharts: {
          template: `<div data-testid="${testIds.FinanceCharts}" />`,
        },
        FinanceRecordList: {
          template: `<div data-testid="${testIds.FinanceRecordList}" />`,
        },
        SearchFiltersSection: {
          template: `<div data-testid="${testIds.SearchFiltersSection}" />`,
        },
        teleport: true,
        TotalRevenuesAndExpenses: {
          template: `<div data-testid="${testIds.TotalRevenuesAndExpenses}" />`,
        },
        ...stubOverrides,
      },
    },
  })()

  if (shouldFlushPromises) await flushPromises()

  return wrapper
}

test('hides page content while loading', async () => {
  vi.spyOn(useWatchFinanceQueryParams, 'useWatchFinanceQueryParams').mockReturnValue({
    error: ref<null>(null),
    isLoading: ref(true),
  })

  const wrapper = await mountComponent()
  const pageContent = wrapper.find('div.flow')
  expect(pageContent.exists()).toBe(false)
})

test('renders a page title', async () => {
  const wrapper = await mountComponent({ shouldFlushPromises: false })
  const mainHeading = wrapper.get('h1')
  expect(mainHeading.text()).toBe(FINANCES_COPY.FINANCES)
})

test('renders total revenue and expenses', async () => {
  const wrapper = await mountComponent()
  commonAsserts.rendersElementWithTestId({
    testId: testIds.TotalRevenuesAndExpenses,
    wrapper,
  })
})

test('renders finance charts', async () => {
  const wrapper = await mountComponent()

  commonAsserts.rendersElementWithTestId({
    testId: testIds.FinanceCharts,
    wrapper,
  })
})

test('renders a list of finance records', async () => {
  const wrapper = await mountComponent()

  commonAsserts.rendersElementWithTestId({
    testId: testIds.FinanceRecordList,
    wrapper,
  })
})

test('renders a button to create a finance record', async () => {
  const wrapper = await mountComponent()

  commonAsserts.rendersElementWithTestId({
    testId: testIds.CreateFinanceRecordButton,
    wrapper,
  })
})

test('renders a modal to create a finance record', async () => {
  const wrapper = await mountComponent()

  commonAsserts.rendersElementWithTestId({
    testId: testIds.CreateFinanceRecordModal,
    wrapper,
  })
})

test('renders a modal to edit a finance record', async () => {
  const wrapper = await mountComponent()

  commonAsserts.rendersElementWithTestId({
    testId: testIds.EditFinanceRecordModal,
    wrapper,
  })
})

test('renders a modal to delete a finance record', async () => {
  const wrapper = await mountComponent()

  commonAsserts.rendersElementWithTestId({
    testId: testIds.DeleteFinanceRecordModal,
    wrapper,
  })
})

test('renders a modal to filter finance records', async () => {
  const wrapper = await mountComponent()

  commonAsserts.rendersElementWithTestId({
    testId: testIds.SearchFiltersSection,
    wrapper,
  })
})

test('provides the delete finance record state', async () => {
  const financeRecord = createTestFinanceRecord()

  vi.spyOn(deleteFinanceRecordProvider, 'useDeleteFinanceRecordProvider').mockReturnValue({
    financeRecordToDelete: financeRecord,
    setFinanceRecordToDelete: vi.fn(),
  })

  const ListStub = defineComponent({
    setup() {
      const provider = inject(deleteFinanceRecordProvider.DELETE_FINANCE_RECORD_SYMBOL)
      return { provider }
    },
    template: `<span id="financeRecordId">{{ provider.financeRecordToDelete.id }}</span>`,
  })

  const wrapper = await mountComponent({
    stubOverrides: { FinanceRecordList: ListStub },
  })

  expect(wrapper.get('#financeRecordId').text()).toBe(financeRecord.id.toString())
})

test('provides save finance record state', async () => {
  const isCreating = true
  const financeRecord = createTestFinanceRecord()

  vi.spyOn(saveFinanceRecordProvider, 'useSaveFinanceRecordProvider').mockReturnValue({
    isCreating,
    financeRecordToEdit: financeRecord,
    setIsCreating: vi.fn(),
    setFinanceRecordToEdit: vi.fn(),
  })

  const ListStub = defineComponent({
    setup() {
      const provider = inject(saveFinanceRecordProvider.SAVE_FINANCE_RECORD_SYMBOL)
      return { provider }
    },
    template: `
      <div>
        <span id="providerIsCreating">{{ provider.isCreating }}</span>
        <span id="providerFinanceRecordId">{{ provider.financeRecordToEdit.id }}</span>
      </div>
    `,
  })

  const wrapper = await mountComponent({
    stubOverrides: { FinanceRecordList: ListStub },
  })

  expect(wrapper.get('#providerIsCreating').text()).toBe(isCreating.toString())
  expect(wrapper.get('#providerFinanceRecordId').text()).toBe(financeRecord.id.toString())
})

describe('with an error', () => {
  let wrapper: VueWrapper
  const errorMessage = 'API exploded'

  beforeEach(async () => {
    vi.spyOn(useWatchFinanceQueryParams, 'useWatchFinanceQueryParams').mockReturnValue({
      error: ref<Error>(new Error(errorMessage)),
      isLoading: ref(false),
    })

    wrapper = await mountComponent()
  })

  test('renders an error message', () => {
    const component = wrapper.getComponent(ErrorMessage)
    expect(component.text()).toBe(`Error: ${errorMessage}`)
  })

  test('hides page content', () => {
    const pageContent = wrapper.find('div.flow')
    expect(pageContent.exists()).toBe(false)
  })
})
