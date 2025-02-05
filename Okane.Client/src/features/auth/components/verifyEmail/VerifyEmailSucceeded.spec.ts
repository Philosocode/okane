// Internal
import VerifyEmailSucceeded from '@features/auth/components/verifyEmail/VerifyEmailSucceeded.vue'

import { appRoutes } from '@shared/services/router/router'
import { AUTH_COPY } from '@features/auth/constants/copy'

const mountComponent = getMountComponent(VerifyEmailSucceeded, { withRouter: true })

test('renders the expected success text', () => {
  const wrapper = mountComponent()
  const heading = wrapper.findByText('p', AUTH_COPY.VERIFY_EMAIL.VERIFICATION_SUCCEEDED.SUCCEEDED)
  expect(heading).toBeDefined()
})

test('renders a link to login', () => {
  const wrapper = mountComponent()
  const link = wrapper.get('a')
  expect(link.attributes('href')).toBe(appRoutes.login.buildPath())
  expect(link.text()).toBe(AUTH_COPY.VERIFY_EMAIL.VERIFICATION_SUCCEEDED.CLICK_HERE_TO_LOGIN)
})
