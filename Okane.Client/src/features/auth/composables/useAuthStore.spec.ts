// External
import { http, HttpResponse } from 'msw'

// Internal
import { AUTH_API_ROUTES } from '@features/auth/constants/apiRoutes'
import { HTTP_STATUS_CODE } from '@shared/constants/http'

import { type AuthenticateResponse } from '@features/auth/types/authResponse'

import { useAuthStore } from '@features/auth/composables/useAuthStore'

import * as appQueryClient from '@shared/services/queryClient/queryClient'
import { apiClient } from '@shared/services/apiClient/apiClient'
import { testQueryClient } from '@tests/queryClient/testQueryClient'
import { testServer } from '@tests/msw/testServer'

import { createTestAuthFormState } from '@tests/factories/authForm'
import { createTestJWTToken } from '@tests/factories/jwtToken'
import { createTestUser } from '@tests/factories/user'
import { omitObjectKeys } from '@shared/utils/object'
import { wrapInAPIResponse } from '@tests/utils/apiResponse'

const formData = createTestAuthFormState()
const authResponse: AuthenticateResponse = {
  items: [{ jwtToken: createTestJWTToken(), user: createTestUser() }],
  status: HTTP_STATUS_CODE.OK_200,
}

beforeEach(() => {
  testServer.use(
    http.post(`/api${AUTH_API_ROUTES.LOGIN()}`, () => HttpResponse.json(authResponse)),
    http.post(`/api${AUTH_API_ROUTES.REFRESH_TOKEN()}`, () => HttpResponse.json(authResponse)),
    http.post(`/api${AUTH_API_ROUTES.LOGOUT()}`, () => HttpResponse.json(wrapInAPIResponse(null))),
  )
})

afterEach(() => {
  vi.restoreAllMocks()
})

test('register', async () => {
  const spy = vi.spyOn(apiClient, 'post').mockResolvedValue(wrapInAPIResponse(null))

  const authStore = useAuthStore()
  await authStore.register(formData.email, formData.name, formData.password)

  expect(spy).toHaveBeenCalledTimes(1)
  expect(spy).toHaveBeenCalledWith(
    AUTH_API_ROUTES.REGISTER(),
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

test('logout', async () => {
  const authStore = useAuthStore()
  authStore.$patch({
    authUser: createTestUser(),
    jwtToken: createTestJWTToken(),
  })

  const queryKey = ['key']
  testQueryClient.setQueryData(queryKey, 'value')
  vi.spyOn(appQueryClient, 'getQueryClient').mockReturnValue(testQueryClient)

  await authStore.logout()

  expect(authStore.authUser).toBeUndefined()
  expect(authStore.jwtToken).toBeUndefined()
  expect(testQueryClient.getQueryData(queryKey)).toBeUndefined()
})
