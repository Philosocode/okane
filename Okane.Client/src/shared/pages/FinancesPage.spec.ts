// External
import { defineComponent, inject } from 'vue'

// Internal
import FinancesPage from '@shared/pages/FinancesPage.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import * as deleteFinanceRecordIdProvider from '@features/financeRecords/providers/deleteFinanceRecordIdProvider'
import * as saveFinanceRecordProvider from '@features/financeRecords/providers/saveFinanceRecordProvider'

import { commonAsserts } from '@tests/utils/commonAsserts'
import { createTestFinanceRecord } from '@tests/factories/financeRecord'

const testIds = {
  AddFinanceRecordButton: 'AddFinanceRecordButton',
  CreateFinanceRecordModal: 'CreateFinanceRecordModal',
  DeleteFinanceRecordModal: 'DeleteFinanceRecordModal',
  EditFinanceRecordModal: 'EditFinanceRecordModal',
  Heading: 'Heading',
  FinanceRecordList: 'FinanceRecordList',
  SearchFiltersSection: 'SearchFiltersSection',
}

const mountComponent = getMountComponent(FinancesPage, {
  global: {
    stubs: {
      AddFinanceRecordButton: {
        template: `<div data-testid="${testIds.AddFinanceRecordButton}" />`,
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
      FinanceRecordList: {
        template: `<div data-testid="${testIds.FinanceRecordList}" />`,
      },
      SearchFiltersSection: {
        template: `<div data-testid="${testIds.SearchFiltersSection}" />`,
      },
    },
  },
})

test('renders a page title', () => {
  const wrapper = mountComponent()
  const mainHeading = wrapper.get('h1')
  expect(mainHeading.text()).toBe(FINANCES_COPY.FINANCES)
})

test('renders a list of finance records', () => {
  commonAsserts.rendersElementWithTestId({
    testId: testIds.FinanceRecordList,
    wrapper: mountComponent(),
  })
})

test('renders a button to create a finance record', () => {
  commonAsserts.rendersElementWithTestId({
    testId: testIds.AddFinanceRecordButton,
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

test('renders a modal to search finance records', () => {
  commonAsserts.rendersElementWithTestId({
    testId: testIds.SearchFiltersSection,
    wrapper: mountComponent(),
  })
})

test('provides delete finance record state', () => {
  const fakeId = 123
  const providerSpy = vi
    .spyOn(deleteFinanceRecordIdProvider, 'useDeleteFinanceRecordId')
    .mockReturnValue({
      id: fakeId,
      setId: vi.fn(),
    })

  const ListStub = defineComponent({
    setup() {
      const provider = inject(deleteFinanceRecordIdProvider.DELETE_FINANCE_RECORD_ID_SYMBOL)
      return { provider }
    },
    template: `<span id="providerId">{{ provider.id }}</span>`,
  })

  const wrapper = mountComponent({
    global: {
      stubs: {
        FinanceRecordList: ListStub,
      },
    },
  })

  expect(wrapper.get('#providerId').text()).toBe(fakeId.toString())

  providerSpy.mockRestore()
})

test('provides save finance record state', () => {
  const isCreating = true
  const financeRecord = createTestFinanceRecord()

  const providerSpy = vi
    .spyOn(saveFinanceRecordProvider, 'useSaveFinanceRecordProvider')
    .mockReturnValue({
      isCreating,
      editingFinanceRecord: financeRecord,
      setIsCreating: vi.fn(),
      setEditingFinanceRecord: vi.fn(),
    })

  const ListStub = defineComponent({
    setup() {
      const provider = inject(saveFinanceRecordProvider.SAVE_FINANCE_RECORD_SYMBOL)
      return { provider }
    },
    template: `
      <div>
        <span id="providerIsCreating">{{ provider.isCreating }}</span>
        <span id="providerFinanceRecordId">{{ provider.editingFinanceRecord.id }}</span>
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

  providerSpy.mockRestore()
})
