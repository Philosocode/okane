// External
import { http, HttpResponse } from 'msw'

// Internal
import { HTTP_STATUS_CODE } from '@shared/constants/http.constants'

import type { AuthenticateResponse } from '@features/auth/auth.types'

import { useAuthStore } from '@features/auth/useAuthStore'

import * as appQueryClient from '@shared/services/queryClient/queryClient'
import { apiClient } from '@shared/services/apiClient/apiClient.service'
import { testQueryClient } from '@tests/queryClient/testQueryClient'
import { testServer } from '@tests/msw/testServer'

import { createStubAuthFormState } from '@tests/factories/authFormState.factory'
import { createStubJWTToken } from '@tests/factories/jwtToken.factory'
import { createStubUser } from '@tests/factories/user.factory'
import { omitObjectKeys } from '@shared/utils/object.utils'
import { wrapInAPIResponse } from '@tests/factories/apiResponse.factory'

const formData = createStubAuthFormState()
const authResponse: AuthenticateResponse = {
  items: [{ jwtToken: createStubJWTToken(), user: createStubUser() }],
  status: HTTP_STATUS_CODE.OK_200,
}

beforeEach(() => {
  testServer.use(
    http.post('/api/auth/login', () => HttpResponse.json(authResponse)),
    http.post('/api/auth/refresh-token', () => HttpResponse.json(authResponse)),
    http.post('/api/auth/logout', () => HttpResponse.json(wrapInAPIResponse(null))),
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
  expect(spy).toHaveBeenCalledWith('/auth/register', omitObjectKeys(formData, ['passwordConfirm']))
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
test.only('logout', async () => {
  const authStore = useAuthStore()
  authStore.$patch({
    authUser: createStubUser(),
    jwtToken: createStubJWTToken(),
  })

  const queryKey = ['key']
  testQueryClient.setQueryData(queryKey, 'value')
  vi.spyOn(appQueryClient, 'getQueryClient').mockReturnValue(testQueryClient)

  await authStore.logout()

  expect(authStore.authUser).toBeUndefined()
  expect(authStore.jwtToken).toBeUndefined()
  expect(testQueryClient.getQueryData(queryKey)).toBeUndefined()
})
