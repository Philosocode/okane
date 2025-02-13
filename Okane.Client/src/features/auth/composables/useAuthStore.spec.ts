// External
import { http, HttpResponse } from 'msw'

// Internal
import { authApiRoutes } from '@features/auth/constants/apiRoutes'
import { HONEYPOT_INPUT_NAME } from '@shared/constants/form'
import { HTTP_HEADER } from '@shared/constants/http'
import { HTTP_STATUS_CODE } from '@shared/constants/http'

import { type AuthenticateResponse } from '@features/auth/types/authResponse'
import { type RegisterRequest } from '@features/auth/types/authForm'

import { useAuthStore } from '@features/auth/composables/useAuthStore'

import * as appQueryClient from '@shared/services/queryClient/queryClient'
import * as router from '@shared/services/router/router'
import { createAppRouter, ROUTE_NAME } from '@shared/services/router/router'
import { apiClient } from '@shared/services/apiClient/apiClient'

import { testQueryClient } from '@tests/queryClient/testQueryClient'
import { testServer } from '@tests/msw/testServer'

import { createTestJwtToken } from '@tests/factories/jwtToken'
import { createTestUser } from '@tests/factories/user'
import { omitObjectKeys } from '@shared/utils/object'
import { wrapInApiResponse } from '@tests/utils/apiResponse'

const formData = {
  email: 'test@test.com',
  name: 'Test',
  password: 'Aa1@'.repeat(4),
  passwordConfirm: 'Aa1@'.repeat(4),
  [HONEYPOT_INPUT_NAME]: "I swear I'm a human",
}

const authResponse: AuthenticateResponse = {
  items: [{ jwtToken: createTestJwtToken(), user: createTestUser() }],
  status: HTTP_STATUS_CODE.OK_200,
}

beforeEach(() => {
  testServer.use(
    http.post(`/api${authApiRoutes.login()}`, () => HttpResponse.json(authResponse)),
    http.post(`/api${authApiRoutes.refreshToken()}`, () => HttpResponse.json(authResponse)),
    http.post(`/api${authApiRoutes.logout()}`, () => HttpResponse.json(wrapInApiResponse(null))),
  )
})

afterEach(() => {
  vi.restoreAllMocks()
})

test('register', async () => {
  const spy = vi.spyOn(apiClient, 'post').mockResolvedValue(wrapInApiResponse(null))
  const request: RegisterRequest = {
    email: formData.email,
    name: formData.name,
    password: formData.password,
    [HONEYPOT_INPUT_NAME]: formData[HONEYPOT_INPUT_NAME],
  }

  const authStore = useAuthStore()
  await authStore.register(request)

  expect(spy).toHaveBeenCalledTimes(1)
  expect(spy).toHaveBeenCalledWith(
    authApiRoutes.register(),
    omitObjectKeys(formData, ['passwordConfirm']),
    {
      headers: {
        [HTTP_HEADER.X_USER_EMAIL]: request.email,
      },
    },
  )
})

test('login', async () => {
  const authStore = useAuthStore()
  await authStore.login({
    email: formData.email,
    password: formData.password,
    [HONEYPOT_INPUT_NAME]: formData[HONEYPOT_INPUT_NAME],
  })

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
    jwtToken: createTestJwtToken(),
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
