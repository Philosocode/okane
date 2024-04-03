// External
import { type MockInstance } from 'vitest'

// Internal
import * as appQueryClient from '@shared/services/queryClient/queryClient'
import { useAuthenticatedAuthStore } from '@tests/composables/auth.composables'

import { testQueryClient } from '@tests/queryClient/testQueryClient'
import { getRouter, ROUTE_MAP } from '@shared/services/router/router.service'

test('allows access to public routes', async () => {
  const router = getRouter()
  await router.push(ROUTE_MAP.REGISTER.buildPath())
  expect(location.pathname).toBe(ROUTE_MAP.REGISTER.buildPath())
})

describe('as an unauthenticated user trying to access a protected route', () => {
  const queryKey = ['key']
  let queryClientSpy: MockInstance

  beforeEach(async () => {
    testQueryClient.setQueryData(queryKey, 'value')
    queryClientSpy = vi.spyOn(appQueryClient, 'getQueryClient').mockReturnValue(testQueryClient)

    const router = getRouter()
    await router.push(ROUTE_MAP.DASHBOARD.buildPath())
  })

  afterEach(() => {
    queryClientSpy.mockRestore()
  })

  test('redirects unauthenticated users to the login page', async () => {
    expect(location.pathname).toBe(ROUTE_MAP.LOGIN.buildPath())
  })

  test('clears the query cache', () => {
    expect(testQueryClient.getQueryData(queryKey)).toBeUndefined()
  })
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
