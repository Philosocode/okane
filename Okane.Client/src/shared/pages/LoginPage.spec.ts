// External
import { flushPromises } from '@vue/test-utils'

// Internal
import AuthForm from '@features/auth/AuthForm.vue'
import LoginPage from '@shared/pages/LoginPage.vue'

import { useAuthStore } from '@features/auth/useAuthStore'
import { useMockedStore } from '@tests/composables/useMockedStore.composable'

import { createAppRouter, ROUTE_MAP, ROUTE_NAME } from '@shared/services/router/router.service'
import { createStubAuthFormState } from '@tests/factories/authFormState.factory'

const router = createAppRouter()
const mountComponent = getMountComponent(LoginPage, { withPinia: true, withRouter: router })

const formData = createStubAuthFormState()

beforeEach(async () => {
  await router.push({ name: ROUTE_NAME.LOGIN })
})

test('renders a login heading', () => {
  const wrapper = mountComponent()
  const heading = wrapper.get('h1')
  expect(heading.text()).toBe('Login')
})

test('redirects to the dashboard page on successful login', async () => {
  const authStore = useMockedStore(useAuthStore)
  vi.spyOn(authStore, 'login').mockResolvedValue()

  const wrapper = mountComponent()

  wrapper.findComponent(AuthForm).vm.$emit('submit', formData)
  await flushPromises()

  expect(location.pathname).toBe(ROUTE_MAP.DASHBOARD.buildPath())
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

  expect(location.pathname).toBe(ROUTE_MAP.LOGIN.buildPath())
})
