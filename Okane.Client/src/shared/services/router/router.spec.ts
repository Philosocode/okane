// Internal
import { useAuthenticatedAuthStore } from '@tests/composables/useAuthenticatedAuthStore'

import * as appQueryClient from '@shared/services/queryClient/queryClient'

import { testQueryClient } from '@tests/queryClient/testQueryClient'
import { getRouter, appRoutes } from '@shared/services/router/router'

test('allows access to public routes', async () => {
  const router = getRouter()
  await router.push(appRoutes.register.buildPath())
  expect(location.pathname).toBe(appRoutes.register.buildPath())
})

describe('as an unauthenticated user trying to access a protected route', () => {
  const queryKey = ['key']

  beforeEach(async () => {
    testQueryClient.setQueryData(queryKey, 'value')
    vi.spyOn(appQueryClient, 'getQueryClient').mockReturnValue(testQueryClient)

    const router = getRouter()
    await router.push(appRoutes.finances.buildPath())
  })

  test('redirects unauthenticated users to the login page', async () => {
    expect(location.pathname).toBe(appRoutes.login.buildPath())
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
    await router.push(appRoutes.finances.buildPath())
    expect(location.pathname).toBe(appRoutes.finances.buildPath())
  })

  test('does not allow access to public-only routes', async () => {
    const router = getRouter()
    await router.push(appRoutes.register.buildPath())
    expect(location.pathname).toBe(appRoutes.finances.buildPath())
  })
})
