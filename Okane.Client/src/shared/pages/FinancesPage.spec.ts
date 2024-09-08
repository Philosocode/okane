// Internal
import FinancesPage from '@shared/pages/FinancesPage.vue'

import { commonTests } from '@tests/utils/commonTests'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

const testIds = {
  AddFinanceRecordButton: 'AddFinanceRecordButton',
  CreateFinanceRecordModal: 'CreateFinanceRecordModal',
  DeleteFinanceRecordModal: 'DeleteFinanceRecordModal',
  EditFinanceRecordModal: 'EditFinanceRecordModal',
  Heading: 'Heading',
  FinanceRecordList: 'FinanceRecordList',
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
    },
  },
})

test('renders a page title', () => {
  const wrapper = mountComponent()
  const mainHeading = wrapper.get('h1')
  expect(mainHeading.text()).toBe(FINANCES_COPY.FINANCES)
})

commonTests.rendersElementWithTestId({
  testName: 'renders a list of finance records',
  getWrapper: mountComponent,
  testId: testIds.FinanceRecordList,
})

commonTests.rendersElementWithTestId({
  testName: 'renders a button to create a finance record',
  getWrapper: mountComponent,
  testId: testIds.AddFinanceRecordButton,
})

commonTests.rendersElementWithTestId({
  testName: 'renders a modal to create a finance record',
  getWrapper: mountComponent,
  testId: testIds.CreateFinanceRecordModal,
})

commonTests.rendersElementWithTestId({
  testName: 'renders a modal to edit a finance record',
  getWrapper: mountComponent,
  testId: testIds.EditFinanceRecordModal,
})

commonTests.rendersElementWithTestId({
  testName: 'renders a modal to delete a finance record',
  getWrapper: mountComponent,
  testId: testIds.DeleteFinanceRecordModal,
})
