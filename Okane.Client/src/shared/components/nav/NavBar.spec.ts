// Internal
import NavBar from '@shared/components/nav/NavBar.vue'

import { authHandlers } from '@tests/msw/handlers/auth'
import { AUTH_COPY } from '@features/auth/constants/copy'
import { appRoutes } from '@shared/services/router/router'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { SHARED_COPY } from '@shared/constants/copy'

import { useAuthStore } from '@features/auth/composables/useAuthStore'

import { testServer } from '@tests/msw/testServer'

import { createTestJwtToken } from '@tests/factories/jwtToken'
import { createTestUser } from '@tests/factories/user'
import { useMockedStore } from '@tests/composables/useMockedStore'
import { mapFinanceRecordSearchFilters } from '@features/financeRecords/utils/mappers'
import { DEFAULT_FINANCE_RECORD_SEARCH_FILTERS } from '@features/financeRecords/constants/searchFilters'
import { useFinanceRecordSearchStore } from '@features/financeRecords/composables/useFinanceRecordSearchStore'
import type { FinanceRecordSearchFilters } from '@features/financeRecords/types/searchFilters'
import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'

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

test('does not render a tags link', () => {
  sharedAsserts.doesNotRenderLink({ text: SHARED_COPY.NOUNS.TAGS })
})

test('does not render an account link', () => {
  sharedAsserts.doesNotRenderLink({ text: AUTH_COPY.ACCOUNT })
})

test('does not render a logout link', () => {
  sharedAsserts.doesNotRenderLink({ text: AUTH_COPY.LOGOUT })
})

describe('when authenticated', () => {
  beforeEach(() => {
    const authStore = useAuthStore()

    authStore.authUser = createTestUser()
    authStore.jwtToken = createTestJwtToken()
  })

  test('renders a finances link with the expected query params', () => {
    const filters: FinanceRecordSearchFilters = {
      ...DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
      type: FINANCE_RECORD_TYPE.REVENUE,
    }
    const searchStore = useFinanceRecordSearchStore()
    searchStore.setFilters(filters)

    const searchParams = mapFinanceRecordSearchFilters.to.URLSearchParams(filters)
    const decodedSearchParams = decodeURIComponent(searchParams.toString())

    // URLSearchParams automatically encode query params. Vue-router, however, automatically decodes
    // the query params. We need to decode the above search params to get them to match.
    const expectedLink = `${appRoutes.finances.buildPath()}?${decodedSearchParams}`
    sharedAsserts.rendersLink({
      link: expectedLink,
      text: FINANCES_COPY.FINANCES,
    })
  })

  test('does not render a tags link', () => {
    sharedAsserts.rendersLink({
      link: appRoutes.manageFinanceTags.buildPath(),
      text: SHARED_COPY.NOUNS.TAGS,
    })
  })

  test('renders an account link', () => {
    sharedAsserts.rendersLink({
      link: appRoutes.account.buildPath(),
      text: AUTH_COPY.ACCOUNT,
    })
  })

  test('renders a logout link', async () => {
    testServer.use(authHandlers.postLogoutSuccess())

    const authStore = useMockedStore(useAuthStore)
    const logout = vi.spyOn(authStore, 'logout').mockImplementation(() => Promise.resolve())

    const wrapper = mountComponent()
    const logoutLink = wrapper.findByText('a', AUTH_COPY.LOGOUT)

    expect(logout).not.toHaveBeenCalled()
    await logoutLink.trigger('click')
    expect(logout).toHaveBeenCalledOnce()
  })

  test('does not render a login link', () => {
    sharedAsserts.doesNotRenderLink({ text: AUTH_COPY.AUTH_FORM.LOGIN })
  })

  test('does not render a register link', () => {
    sharedAsserts.doesNotRenderLink({ text: AUTH_COPY.AUTH_FORM.REGISTER })
  })
})
