// Internal
import LoginPage from '@shared/pages/LoginPage.vue'
import LoginForm from '@features/auth/components/LoginForm.vue'

const mountComponent = getMountComponent(LoginPage, {
  withQueryClient: true,
  withRouter: true,
})

test('renders a LoginForm', () => {
  const wrapper = mountComponent()
  expect(wrapper.findComponent(LoginForm).exists()).toBe(true)
})
