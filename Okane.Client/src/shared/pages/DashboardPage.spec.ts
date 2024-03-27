// Internal
import DashboardPage from '@shared/pages/DashboardPage.vue'

const mountComponent = getMountComponent(DashboardPage)

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
