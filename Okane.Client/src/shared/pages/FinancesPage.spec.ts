// External
import { defineComponent, inject } from 'vue'

// Internal
import FinancesPage from '@shared/pages/FinancesPage.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import * as deleteFinanceRecordProvider from '@features/financeRecords/providers/deleteFinanceRecordProvider'
import * as saveFinanceRecordProvider from '@features/financeRecords/providers/saveFinanceRecordProvider'

import { commonAsserts } from '@tests/utils/commonAsserts'
import { createTestFinanceRecord } from '@tests/factories/financeRecord'

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

const mountComponent = getMountComponent(FinancesPage, {
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
    },
  },
})

test('renders a page title', () => {
  const wrapper = mountComponent()
  const mainHeading = wrapper.get('h1')
  expect(mainHeading.text()).toBe(FINANCES_COPY.FINANCES)
})

test('renders total revenue and expenses', () => {
  commonAsserts.rendersElementWithTestId({
    testId: testIds.TotalRevenuesAndExpenses,
    wrapper: mountComponent(),
  })
})

test('renders finance charts', () => {
  commonAsserts.rendersElementWithTestId({
    testId: testIds.FinanceCharts,
    wrapper: mountComponent(),
  })
})

test('renders a list of finance records', () => {
  commonAsserts.rendersElementWithTestId({
    testId: testIds.FinanceRecordList,
    wrapper: mountComponent(),
  })
})

test('renders a button to create a finance record', () => {
  commonAsserts.rendersElementWithTestId({
    testId: testIds.CreateFinanceRecordButton,
    wrapper: mountComponent(),
  })
})

test('renders a modal to create a finance record', () => {
  commonAsserts.rendersElementWithTestId({
    testId: testIds.CreateFinanceRecordModal,
    wrapper: mountComponent(),
  })
})

test('renders a modal to edit a finance record', () => {
  commonAsserts.rendersElementWithTestId({
    testId: testIds.EditFinanceRecordModal,
    wrapper: mountComponent(),
  })
})

test('renders a modal to delete a finance record', () => {
  commonAsserts.rendersElementWithTestId({
    testId: testIds.DeleteFinanceRecordModal,
    wrapper: mountComponent(),
  })
})

test('renders a modal to filter finance records', () => {
  commonAsserts.rendersElementWithTestId({
    testId: testIds.SearchFiltersSection,
    wrapper: mountComponent(),
  })
})

test('provides the delete finance record state', () => {
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

  const wrapper = mountComponent({
    global: {
      stubs: {
        FinanceRecordList: ListStub,
      },
    },
  })

  expect(wrapper.get('#financeRecordId').text()).toBe(financeRecord.id.toString())
})

test('provides save finance record state', () => {
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

  const wrapper = mountComponent({
    global: {
      stubs: {
        FinanceRecordList: ListStub,
      },
    },
  })

  expect(wrapper.get('#providerIsCreating').text()).toBe(isCreating.toString())
  expect(wrapper.get('#providerFinanceRecordId').text()).toBe(financeRecord.id.toString())
})
