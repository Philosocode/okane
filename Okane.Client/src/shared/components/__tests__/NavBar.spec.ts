// External
import { flushPromises } from '@vue/test-utils'

// Internal
import NavBar from '@/shared/components/NavBar.vue'

import { AUTH_HANDLER_MAP } from '@tests/msw/handlers/auth.handlers'
import { ROUTE_NAME } from '@/shared/services/router/router.constants'

import { useAuthStore } from '@/features/auth/useAuthStore'

import { mockServer } from '@tests/msw/mockServer'

import { createMockUser } from '@tests/factories/user.factory'
import { getURLByRouteName } from '@/shared/services/router/router.utils'

const mountComponent = getMountComponent(NavBar, {
  withPinia: true,
  withRouter: true,
})

test('renders links for unauthenticated users', () => {
  const wrapper = mountComponent()

  const allLinks = wrapper.findAll('a')
  expect(allLinks).toHaveLength(2)

  const loginLink = wrapper.findByText('a', 'Login')
  expect(loginLink.attributes('href')).toBe(getURLByRouteName(ROUTE_NAME.LOGIN))

  const registerLink = wrapper.findByText('a', 'Register')
  expect(registerLink.attributes('href')).toBe(getURLByRouteName(ROUTE_NAME.REGISTER))
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

    const dashboardURL = getURLByRouteName(ROUTE_NAME.DASHBOARD)
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
    expect(globalThis.location.pathname).toBe(getURLByRouteName(ROUTE_NAME.LOGIN))
  })
})
