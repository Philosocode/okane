// Internal
import DashboardPage from '@shared/pages/DashboardPage.vue'

const testIds = {
  FinanceRecordList: 'FinanceRecordListStub',
  SaveFinanceRecordForm: 'SaveFinanceRecordFormStub',
}

const mountComponent = getMountComponent(DashboardPage, {
  withQueryClient: true,
  global: {
    stubs: {
      FinanceRecordList: { template: `<div data-testid="${testIds.FinanceRecordList}" />` },
      SaveFinanceRecordForm: { template: `<div data-testid="${testIds.SaveFinanceRecordForm}" />` },
    },
  },
})

test('renders a Dashboard heading', () => {
  const wrapper = mountComponent()
  const mainHeading = wrapper.get('h1')

  expect(mainHeading.text()).toBe('Dashboard')
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
