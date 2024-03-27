// External
import { flushPromises } from '@vue/test-utils'

// Internal
import AuthForm from '@/features/auth/AuthForm.vue'
import RegisterPage from '@/shared/pages/RegisterPage.vue'

import { useAuthStore } from '@/features/auth/useAuthStore'
import { useMockedStore } from '@tests/composables/useMockedStore.composable'

import { createMockAuthFormState } from '@tests/factories/authFormState.factory'
import { createAppRouter, ROUTE_MAP, ROUTE_NAME } from '@/shared/services/router/router.service'

const router = createAppRouter()
const mountComponent = getMountComponent(RegisterPage, { withPinia: true, withRouter: router })

const formData = createMockAuthFormState()

beforeEach(async () => {
  await router.push({ name: ROUTE_NAME.REGISTER })
})

test('renders a register heading', () => {
  const wrapper = mountComponent()
  const heading = wrapper.get('h1')
  expect(heading.text()).toBe('Register')
})

test('redirects to the login page on successful login', async () => {
  const authStore = useMockedStore(useAuthStore)
  vi.spyOn(authStore, 'register').mockResolvedValue()

  const wrapper = mountComponent()

  wrapper.findComponent(AuthForm).vm.$emit('submit', formData)
  await flushPromises()

  expect(location.pathname).toBe(ROUTE_MAP.LOGIN.buildPath())
})

test('logs a console error on unsuccessful register', async () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  const registerError = 'Invalid credentials'

  const authStore = useMockedStore(useAuthStore)
  vi.spyOn(authStore, 'register').mockRejectedValue(registerError)

  const wrapper = mountComponent()
  wrapper.findComponent(AuthForm).vm.$emit('submit', formData)

  await flushPromises()

  expect(consoleSpy).toHaveBeenCalledWith('Error registering:', registerError)

  expect(location.pathname).toBe(ROUTE_MAP.REGISTER.buildPath())
})
