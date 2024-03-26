// External
import { flushPromises } from '@vue/test-utils'

// Internal
import NavBar from '@/shared/components/NavBar.vue'

import { AUTH_HANDLER_MAP } from '@tests/msw/handlers/auth.handlers'
import { ROUTE_MAP } from '@/shared/services/router/router.service'

import { useAuthStore } from '@/features/auth/useAuthStore'

import { mockServer } from '@tests/msw/mockServer'

import { createMockUser } from '@tests/factories/user.factory'

const mountComponent = getMountComponent(NavBar, {
  withPinia: true,
  withRouter: true,
})

test('renders links for unauthenticated users', () => {
  const wrapper = mountComponent()

  const allLinks = wrapper.findAll('a')
  expect(allLinks).toHaveLength(2)

  const loginLink = wrapper.findByText('a', 'Login')
  expect(loginLink.attributes('href')).toBe(ROUTE_MAP.LOGIN.buildPath())

  const registerLink = wrapper.findByText('a', 'Register')
  expect(registerLink.attributes('href')).toBe(ROUTE_MAP.REGISTER.buildPath())
})

describe('when authenticated', () => {
  beforeEach(() => {
    const authStore = useAuthStore()

    authStore.authUser = createMockUser()
    authStore.jwtToken = 'test-token'
  })

  test('renders links for authenticated users', () => {
    const wrapper = mountComponent()

    const allLinks = wrapper.findAll('a')
    expect(allLinks).toHaveLength(2)

    const dashboardURL = ROUTE_MAP.DASHBOARD.buildPath()
    const dashboardLink = wrapper.get(`a[href="${dashboardURL}"]`)
    expect(dashboardLink.text()).toBe('Dashboard')

    const logoutLink = wrapper.get(`a[href="/#"]`)
    expect(logoutLink.text()).toBe('Logout')
  })

  test('logs the user out', async () => {
    mockServer.use(AUTH_HANDLER_MAP.LOGOUT_SUCCESS)

    const wrapper = mountComponent()
    const logoutLink = wrapper.findByText('a', 'Logout')
    logoutLink.trigger('click')

    await flushPromises()

    const authStore = useAuthStore()
    expect(authStore.authUser).toBeUndefined()
    expect(authStore.jwtToken).toBeUndefined()
    expect(globalThis.location.pathname).toBe(ROUTE_MAP.LOGIN.buildPath())
  })
})
