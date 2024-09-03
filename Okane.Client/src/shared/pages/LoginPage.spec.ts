// External
import { flushPromises } from '@vue/test-utils'

// Internal
import AuthForm from '@features/auth/components/AuthForm.vue'
import LoginPage from '@shared/pages/LoginPage.vue'

import { AUTH_COPY } from '@features/auth/constants/copy'

import { useAuthStore } from '@features/auth/composables/useAuthStore'
import { useMockedStore } from '@tests/composables/useMockedStore'

import { createAppRouter, appRoutes, ROUTE_NAME } from '@shared/services/router/router'
import { createTestAuthFormState } from '@tests/factories/authForm'

const router = createAppRouter()
const mountComponent = getMountComponent(LoginPage, { withPinia: true, withRouter: router })

const formData = createTestAuthFormState()

beforeEach(async () => {
  await router.push({ name: ROUTE_NAME.LOGIN })
})

test('renders a login heading', () => {
  const wrapper = mountComponent()
  const heading = wrapper.get('h1')
  expect(heading.text()).toBe(AUTH_COPY.LOGIN)
})

test('redirects to the finances page on successful login', async () => {
  const authStore = useMockedStore(useAuthStore)
  vi.spyOn(authStore, 'login').mockResolvedValue()

  const wrapper = mountComponent()

  wrapper.findComponent(AuthForm).vm.$emit('submit', formData)
  await flushPromises()

  expect(location.pathname).toBe(appRoutes.finances.buildPath())
})

test('logs a console error on unsuccessful login', async () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  const loginError = 'Invalid credentials'

  const authStore = useMockedStore(useAuthStore)
  vi.spyOn(authStore, 'login').mockRejectedValue(loginError)

  const wrapper = mountComponent()
  wrapper.findComponent(AuthForm).vm.$emit('submit', formData)

  await flushPromises()

  expect(consoleSpy).toHaveBeenCalledWith('Error logging in:', loginError)

  expect(location.pathname).toBe(appRoutes.login.buildPath())
})
