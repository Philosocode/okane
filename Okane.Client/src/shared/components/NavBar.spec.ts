// External
import { flushPromises } from '@vue/test-utils'

// Internal
import NavBar from '@shared/components/NavBar.vue'

import { authHandlers } from '@tests/msw/handlers/auth'
import { AUTH_COPY } from '@features/auth/constants/copy'
import { appRoutes } from '@shared/services/router/router'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import { useAuthStore } from '@features/auth/composables/useAuthStore'

import { testServer } from '@tests/msw/testServer'

import { createTestJWTToken } from '@tests/factories/jwtToken'
import { createTestUser } from '@tests/factories/user'

const mountComponent = getMountComponent(NavBar, {
  withPinia: true,
  withRouter: true,
})

const sharedAsserts = {
  rendersLink(args: { link: string; text: string }) {
    const wrapper = mountComponent()
    const link = wrapper.findByText('a', args.text)
    expect(link.attributes('href')).toBe(args.link)
  },
  doesNotRenderLink(args: { text: string }) {
    const wrapper = mountComponent()
    const link = wrapper.findByText('a', args.text)
    expect(link).toBeUndefined()
  },
}

test('renders a login link', () => {
  sharedAsserts.rendersLink({
    link: appRoutes.login.buildPath(),
    text: AUTH_COPY.AUTH_FORM.LOGIN,
  })
})

test('renders a register link', () => {
  sharedAsserts.rendersLink({
    link: appRoutes.register.buildPath(),
    text: AUTH_COPY.AUTH_FORM.REGISTER,
  })
})

test('does not render a finances link', () => {
  sharedAsserts.doesNotRenderLink({ text: FINANCES_COPY.FINANCES })
})

test('does not render an account link', () => {
  sharedAsserts.doesNotRenderLink({ text: AUTH_COPY.ACCOUNT_PAGE.LINK })
})

test('does not render a logout link', () => {
  sharedAsserts.doesNotRenderLink({ text: AUTH_COPY.LOGOUT })
})

describe('when authenticated', () => {
  beforeEach(() => {
    const authStore = useAuthStore()

    authStore.authUser = createTestUser()
    authStore.jwtToken = createTestJWTToken()
  })

  test('renders a finances link', () => {
    sharedAsserts.rendersLink({
      link: appRoutes.finances.buildPath(),
      text: FINANCES_COPY.FINANCES,
    })
  })

  test('renders an account link', () => {
    sharedAsserts.rendersLink({
      link: appRoutes.account.buildPath(),
      text: AUTH_COPY.ACCOUNT_PAGE.LINK,
    })
  })

  test('renders a logout link', async () => {
    testServer.use(authHandlers.postLogoutSuccess())

    const wrapper = mountComponent()
    const logoutLink = wrapper.findByText('a', AUTH_COPY.LOGOUT)
    logoutLink.trigger('click')

    await flushPromises()

    const authStore = useAuthStore()
    expect(authStore.authUser).toBeUndefined()
    expect(authStore.jwtToken).toBeUndefined()
    expect(globalThis.location.pathname).toBe(appRoutes.login.buildPath())
  })

  test('does not render a login link', () => {
    sharedAsserts.doesNotRenderLink({ text: AUTH_COPY.AUTH_FORM.LOGIN })
  })

  test('does not render a register link', () => {
    sharedAsserts.doesNotRenderLink({ text: AUTH_COPY.AUTH_FORM.REGISTER })
  })
})
