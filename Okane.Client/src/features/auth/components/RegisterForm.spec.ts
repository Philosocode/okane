// External
import { http, HttpResponse } from 'msw'
import { flushPromises } from '@vue/test-utils'

// Internal
import AuthForm from '@features/auth/components/AuthForm.vue'
import RegisterForm from '@features/auth/components/RegisterForm.vue'

import { authAPIRoutes } from '@features/auth/constants/apiRoutes'
import { AUTH_COPY } from '@features/auth/constants/copy'

import { useAuthStore } from '@features/auth/composables/useAuthStore'
import { useMockedStore } from '@tests/composables/useMockedStore'

import { getMSWURL } from '@tests/utils/url'
import { testServer } from '@tests/msw/testServer'
import { wrapInAPIResponse } from '@tests/utils/apiResponse'
import { createTestAuthFormState, createTestPasswordRequirements } from '@tests/factories/authForm'
import { createAppRouter, appRoutes, ROUTE_NAME } from '@shared/services/router/router'

const router = createAppRouter()
const mountComponent = getMountComponent(RegisterForm, {
  withRouter: router,
  withQueryClient: true,
})

const formData = createTestAuthFormState()

beforeEach(async () => {
  testServer.use(
    http.get(getMSWURL(authAPIRoutes.passwordRequirements()), () =>
      HttpResponse.json(wrapInAPIResponse(createTestPasswordRequirements())),
    ),
  )
  await router.push({ name: ROUTE_NAME.REGISTER })
})

test('renders a register heading', () => {
  const wrapper = mountComponent()
  const heading = wrapper.get('h1')
  expect(heading.text()).toBe(AUTH_COPY.REGISTER)
})

test('emits a succeeded event on successful login', async () => {
  const authStore = useMockedStore(useAuthStore)
  vi.spyOn(authStore, 'register').mockResolvedValue()

  const wrapper = mountComponent()
  wrapper.findComponent(AuthForm).vm.$emit('submit', formData)
  await flushPromises()

  expect(wrapper.emitted('succeeded')).toBeDefined()
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

  expect(location.pathname).toBe(appRoutes.register.buildPath())
})
