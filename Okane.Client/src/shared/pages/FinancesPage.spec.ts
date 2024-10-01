// Internal
import FinancesPage from '@shared/pages/FinancesPage.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import { commonAsserts } from '@tests/utils/commonAsserts'

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
