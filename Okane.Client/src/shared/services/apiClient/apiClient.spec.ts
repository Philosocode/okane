// External
import { http, HttpResponse } from 'msw'

// Internal
import { authAPIRoutes } from '@features/auth/constants/apiRoutes'
import { appRoutes } from '@shared/services/router/router'
import { HTTP_STATUS_CODE, MIME_TYPE } from '@shared/constants/http'

import { type APIResponse } from '@shared/services/apiClient/types'

import { useAuthStore } from '@features/auth/composables/useAuthStore'

import { apiClient } from '@shared/services/apiClient/apiClient'
import { testServer } from '@tests/msw/testServer'

import * as appQueryClient from '@shared/services/queryClient/queryClient'
import { createTestJWTToken } from '@tests/factories/jwtToken'
import { createTestProblemDetails } from '@tests/factories/problemDetails'
import { createTestUser } from '@tests/factories/user'
import { testQueryClient } from '@tests/queryClient/testQueryClient'

import { wrapInAPIResponse } from '@tests/utils/apiResponse'

test('makes a basic GET request', async () => {
  const handler = http.get('/api/ping', () => HttpResponse.json(wrapInAPIResponse('pong')))

  testServer.use(handler)

  const response = await apiClient.get<APIResponse<string>>('/ping')
  expect(response.items[0]).toBe('pong')
})

test('prepends a forward slash to the request URL', async () => {
  const handler = http.get('/api/ping', () => HttpResponse.json(wrapInAPIResponse('pong')))

  testServer.use(handler)

  const response = await apiClient.get<APIResponse<string>>('ping')
  expect(response.items[0]).toBe('pong')
})

describe('with a failed request', async () => {
  test('returns a rejected promise containing the "errors" key if present', async () => {
    const errorResponse = createTestProblemDetails({
      detail: 'Something went wrong...',
      errors: {
        email: ['Invalid email'],
      },
    })

    const handler = http.get('/api/ping', () => {
      return HttpResponse.json(errorResponse, { status: HTTP_STATUS_CODE.BAD_REQUEST_400 })
    })

    testServer.use(handler)

    try {
      await apiClient.get('/ping')
    } catch (err) {
      expect(err).toEqual(errorResponse.errors)
    }
  })

  test('returns a rejected promise containing the "detail" key if no "errors" key is present', async () => {
    const errorResponse = createTestProblemDetails({
      detail: 'Something went wrong...',
    })

    const handler = http.get('/api/ping', () => {
      return HttpResponse.json(errorResponse, { status: HTTP_STATUS_CODE.BAD_REQUEST_400 })
    })

    testServer.use(handler)

    try {
      await apiClient.get('/ping')
    } catch (err) {
      expect(err).toEqual(errorResponse.detail)
    }
  })
})

describe('when not logged in', () => {
  const handler = http.post('/api/ping', ({ request }) => {
    const contentType = request.headers.get('Content-Type')
    if (contentType !== MIME_TYPE.JSON) {
      return new HttpResponse('Invalid content type', { status: HTTP_STATUS_CODE.BAD_REQUEST_400 })
    }

    const authorizationHeader = request.headers.get('Authorization')
    if (authorizationHeader) {
      return new HttpResponse('Invalid authorization header', {
        status: HTTP_STATUS_CODE.UNAUTHORIZED_401,
      })
    }

    return HttpResponse.json(wrapInAPIResponse('pong'))
  })

  beforeEach(() => {
    testServer.use(handler)
  })

  test('includes the Content-Type', async () => {
    const response = await apiClient.post<APIResponse<string>>('/ping')
    expect(response.items[0]).toBe('pong')
  })

  test('does not include the Authorization header', async () => {
    const response = await apiClient.post<APIResponse<string>>('/ping')
    expect(response.items[0]).toBe('pong')
  })
})

describe('when logged in', () => {
  const jwtToken = createTestJWTToken()
  const authUser = createTestUser()

  beforeEach(() => {
    const authStore = useAuthStore()
    authStore.authUser = authUser
    authStore.jwtToken = jwtToken
  })

  test('adds a bearer token to the Authorization header', async () => {
    const handler = http.patch('/api/ping', ({ request }) => {
      const authorizationHeader = request.headers.get('Authorization')
      const expectedHeader = `Bearer ${jwtToken}`

      if (authorizationHeader !== expectedHeader) {
        return new HttpResponse('Invalid authorization header', {
          status: HTTP_STATUS_CODE.UNAUTHORIZED_401,
        })
      }

      return HttpResponse.json(wrapInAPIResponse('pong'))
    })

    testServer.use(handler)

    const response = await apiClient.patch<APIResponse<string>>('/ping')

    expect(response.items[0]).toEqual('pong')
  })

  const logoutHandler = http.post(`/api${authAPIRoutes.logout()}`, () => HttpResponse.json())
  const getErrorHandler = (statusCode: HTTP_STATUS_CODE) =>
    http.get('/api/ping', () => {
      const errorResponse = JSON.stringify(createTestProblemDetails())
      return new HttpResponse(errorResponse, { status: statusCode })
    })

  test.each([[HTTP_STATUS_CODE.UNAUTHORIZED_401], [HTTP_STATUS_CODE.FORBIDDEN_403]])(
    `logs the user out and clears the query cache when the status code is %d`,
    async (statusCode) => {
      const errorHandler = getErrorHandler(statusCode)
      testServer.use(errorHandler, logoutHandler)

      const queryKey = ['key']
      testQueryClient.setQueryData(queryKey, 'value')
      const queryClientSpy = vi
        .spyOn(appQueryClient, 'getQueryClient')
        .mockReturnValue(testQueryClient)

      try {
        await apiClient.get('/ping')
      } catch {
        const authStore = useAuthStore()
        expect(authStore.authUser).toBeUndefined()
        expect(authStore.jwtToken).toBeUndefined()
        expect(location.pathname).toBe(appRoutes.login.buildPath())
        expect(testQueryClient.getQueryData(queryKey)).toBeUndefined()
      } finally {
        queryClientSpy.mockRestore()
      }
    },
  )

  test('does not log the user out with a different error status code', async () => {
    const errorHandler = getErrorHandler(HTTP_STATUS_CODE.BAD_REQUEST_400)

    testServer.use(errorHandler)

    try {
      await apiClient.get('/ping')
    } catch {
      const authStore = useAuthStore()
      expect(authStore.authUser).toEqual(authUser)
      expect(authStore.jwtToken).toEqual(jwtToken)
    }
  })
})
