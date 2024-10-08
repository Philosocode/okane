// External
import { flushPromises } from '@vue/test-utils'

// Internal
import NavBar from '@shared/components/NavBar.vue'

import { authHandlers } from '@tests/msw/handlers/auth'
import { AUTH_COPY } from '@features/auth/constants/copy'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { appRoutes } from '@shared/services/router/router'

import { useAuthStore } from '@features/auth/composables/useAuthStore'

import { testServer } from '@tests/msw/testServer'

import { createTestJWTToken } from '@tests/factories/jwtToken'
import { createTestUser } from '@tests/factories/user'

const mountComponent = getMountComponent(NavBar, {
  withPinia: true,
  withRouter: true,
})

test('renders links for unauthenticated users', () => {
  const wrapper = mountComponent()

  const allLinks = wrapper.findAll('a')
  expect(allLinks).toHaveLength(2)

  const loginLink = wrapper.findByText('a', AUTH_COPY.LOGIN)
  expect(loginLink.attributes('href')).toBe(appRoutes.login.buildPath())

  const registerLink = wrapper.findByText('a', AUTH_COPY.REGISTER)
  expect(registerLink.attributes('href')).toBe(appRoutes.register.buildPath())
})

describe('when authenticated', () => {
  beforeEach(() => {
    const authStore = useAuthStore()

    authStore.authUser = createTestUser()
    authStore.jwtToken = createTestJWTToken()
  })

  test('renders links for authenticated users', () => {
    const wrapper = mountComponent()

    const allLinks = wrapper.findAll('a')
    expect(allLinks).toHaveLength(2)

    const financesURL = appRoutes.finances.buildPath()
    const financesLink = wrapper.get(`a[href="${financesURL}"]`)
    expect(financesLink.text()).toBe(FINANCES_COPY.FINANCES)

    const logoutLink = wrapper.get(`a[href="/#"]`)
    expect(logoutLink.text()).toBe(AUTH_COPY.LOGOUT)
  })

  test('logs the user out', async () => {
    testServer.use(authHandlers.logoutSuccess())

    const wrapper = mountComponent()
    const logoutLink = wrapper.findByText('a', AUTH_COPY.LOGOUT)
    logoutLink.trigger('click')

    await flushPromises()

    const authStore = useAuthStore()
    expect(authStore.authUser).toBeUndefined()
    expect(authStore.jwtToken).toBeUndefined()
    expect(globalThis.location.pathname).toBe(appRoutes.login.buildPath())
  })
})
