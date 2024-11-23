// Internal
import LoginPage from '@shared/pages/LoginPage.vue'
import LoginForm from '@features/auth/components/LoginForm.vue'

import { appRoutes } from '@shared/services/router/router'
import { AUTH_COPY } from '@features/auth/constants/copy'

const mountComponent = getMountComponent(LoginPage, {
  withQueryClient: true,
  withRouter: true,
})

test('renders a LoginForm', () => {
  const wrapper = mountComponent()
  expect(wrapper.findComponent(LoginForm).exists()).toBe(true)
})

test('renders a "forgot password" link', () => {
  const wrapper = mountComponent()
  const link = wrapper.findByText('a', AUTH_COPY.FORGOT_PASSWORD)
  expect(link.attributes('href')).toBe(appRoutes.sendResetPasswordEmail.buildPath())
})
