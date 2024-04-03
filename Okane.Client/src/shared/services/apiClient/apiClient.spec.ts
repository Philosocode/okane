// External
import { http, HttpResponse } from 'msw'

// Internal
import { type APIResponse } from '@shared/services/apiClient/apiClient.types'

import { ROUTE_MAP } from '@shared/services/router/router.service'
import { HTTP_STATUS_CODE, MIME_TYPE } from '@shared/constants/http.constants'

import { useAuthStore } from '@features/auth/useAuthStore'

import { apiClient } from '@shared/services/apiClient/apiClient.service'
import { testServer } from '@tests/msw/testServer'

import * as appQueryClient from '@shared/services/queryClient/queryClient'
import { createStubJWTToken } from '@tests/factories/jwtToken.factory'
import { createStubProblemDetails } from '@tests/factories/problemDetails.factory'
import { createStubUser } from '@tests/factories/user.factory'
import { testQueryClient } from '@tests/queryClient/testQueryClient'

import { wrapInAPIResponse } from '@tests/factories/apiResponse.factory'

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

test('returns a rejected promise on failed request', async () => {
  const errorResponse = createStubProblemDetails({
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
  const jwtToken = createStubJWTToken()
  const authUser = createStubUser()

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

  const logoutHandler = http.post('/api/auth/logout', () => HttpResponse.json())
  const getErrorHandler = (statusCode: HTTP_STATUS_CODE) =>
    http.get('/api/ping', () => {
      const errorResponse = JSON.stringify(createStubProblemDetails())
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
        expect(location.pathname).toBe(ROUTE_MAP.LOGIN.buildPath())
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
