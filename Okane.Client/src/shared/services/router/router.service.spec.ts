// Internal
import { getRouter, ROUTE_MAP } from '@/shared/services/router/router.service'

import { useAuthenticatedAuthStore } from '@tests/composables/auth.composables'

test('allows access to public routes', async () => {
  const router = getRouter()
  await router.push(ROUTE_MAP.REGISTER.buildPath())
  expect(location.pathname).toBe(ROUTE_MAP.REGISTER.buildPath())
})

test('redirects unauthenticated users to the login page', async () => {
  const router = getRouter()
  await router.push(ROUTE_MAP.DASHBOARD.buildPath())
  expect(location.pathname).toBe(ROUTE_MAP.LOGIN.buildPath())
})

describe('as an authenticated user', () => {
  beforeEach(() => {
    useAuthenticatedAuthStore()
  })

  test('allows access to protected routes', async () => {
    const router = getRouter()
    await router.push(ROUTE_MAP.DASHBOARD.buildPath())
    expect(location.pathname).toBe(ROUTE_MAP.DASHBOARD.buildPath())
  })

  test('does not allow access to public-only routes', async () => {
    const router = getRouter()
    await router.push(ROUTE_MAP.REGISTER.buildPath())
    expect(location.pathname).toBe(ROUTE_MAP.DASHBOARD.buildPath())
  })
})
