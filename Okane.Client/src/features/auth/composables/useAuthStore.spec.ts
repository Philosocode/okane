// External
import { http, HttpResponse } from 'msw'

// Internal
import { authAPIRoutes } from '@features/auth/constants/apiRoutes'
import { HTTP_STATUS_CODE } from '@shared/constants/http'

import { type AuthenticateResponse } from '@features/auth/types/authResponse'

import { useAuthStore } from '@features/auth/composables/useAuthStore'

import * as appQueryClient from '@shared/services/queryClient/queryClient'
import * as router from '@shared/services/router/router'
import { apiClient } from '@shared/services/apiClient/apiClient'
import { createAppRouter, ROUTE_NAME } from '@shared/services/router/router'

import { testQueryClient } from '@tests/queryClient/testQueryClient'
import { testServer } from '@tests/msw/testServer'

import { createTestJWTToken } from '@tests/factories/jwtToken'
import { createTestUser } from '@tests/factories/user'
import { omitObjectKeys } from '@shared/utils/object'
import { wrapInApiResponse } from '@tests/utils/apiResponse'

const formData = {
  email: 'test@test.com',
  name: 'Test',
  password: 'Aa1@'.repeat(4),
  passwordConfirm: 'Aa1@'.repeat(4),
}

const authResponse: AuthenticateResponse = {
  items: [{ jwtToken: createTestJWTToken(), user: createTestUser() }],
  status: HTTP_STATUS_CODE.OK_200,
}

beforeEach(() => {
  testServer.use(
    http.post(`/api${authAPIRoutes.login()}`, () => HttpResponse.json(authResponse)),
    http.post(`/api${authAPIRoutes.refreshToken()}`, () => HttpResponse.json(authResponse)),
    http.post(`/api${authAPIRoutes.logout()}`, () => HttpResponse.json(wrapInApiResponse(null))),
  )
})

afterEach(() => {
  vi.restoreAllMocks()
})

test('register', async () => {
  const spy = vi.spyOn(apiClient, 'post').mockResolvedValue(wrapInApiResponse(null))

  const authStore = useAuthStore()
  await authStore.register(formData.email, formData.name, formData.password)

  expect(spy).toHaveBeenCalledTimes(1)
  expect(spy).toHaveBeenCalledWith(
    authAPIRoutes.register(),
    omitObjectKeys(formData, ['passwordConfirm']),
  )
})

test('login', async () => {
  const authStore = useAuthStore()
  await authStore.login(formData.email, formData.password)

  expect(authStore.authUser).toEqual(authResponse.items[0].user)
  expect(authStore.jwtToken).toEqual(authResponse.items[0].jwtToken)

  // Need to manually log out after each test to clear the timeout.
  await authStore.logout()
})

test('handleRefreshToken', async () => {
  const authStore = useAuthStore()
  await authStore.handleRefreshToken()

  expect(authStore.authUser).toEqual(authResponse.items[0].user)
  expect(authStore.jwtToken).toEqual(authResponse.items[0].jwtToken)

  // Need to manually log out after each test to clear the timeout.
  await authStore.logout()
})

function setUpResetState() {
  const authStore = useAuthStore()
  authStore.$patch({
    authUser: createTestUser(),
    jwtToken: createTestJWTToken(),
  })

  const queryKey = ['hey']
  testQueryClient.setQueryData(queryKey, 'value')
  vi.spyOn(appQueryClient, 'getQueryClient').mockReturnValue(testQueryClient)

  return { authStore, queryKey }
}

test('resetState', async () => {
  const { authStore, queryKey } = setUpResetState()
  await authStore.resetState()

  expect(authStore.authUser).toBeUndefined()
  expect(authStore.jwtToken).toBeUndefined()
  expect(testQueryClient.getQueryData(queryKey)).toBeUndefined()
})

test('logout', async () => {
  const testRouter = createAppRouter()
  vi.spyOn(router, 'getRouter').mockReturnValue(testRouter)
  const { authStore, queryKey } = setUpResetState()

  await authStore.logout()

  expect(authStore.authUser).toBeUndefined()
  expect(authStore.jwtToken).toBeUndefined()
  expect(testQueryClient.getQueryData(queryKey)).toBeUndefined()
  expect(testRouter.currentRoute.value.name).toBe(ROUTE_NAME.LOGIN)
})
