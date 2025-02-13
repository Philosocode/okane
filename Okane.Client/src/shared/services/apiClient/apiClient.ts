// Internal
import { HTTP_METHOD, HTTP_STATUS_CODE, MIME_TYPE } from '@shared/constants/http'

import type { ApiResponse } from '@shared/services/apiClient/types'

import { useAuthStore } from '@features/auth/composables/useAuthStore'
import { useToastStore } from '@shared/composables/useToastStore'

import { getQueryClient } from '@shared/services/queryClient/queryClient'
import { objectHasKey } from '@shared/utils/object'
import { removePrefixCharacters } from '@shared/utils/string'

/**
 * Custom wrapper around the Fetch API.
 *
 * @param method
 * @param url
 * @param body
 * @param optionOverrides
 *
 * @see https://jasonwatmore.com/vue-3-pinia-jwt-authentication-with-refresh-tokens-example-tutorial
 * @see https://stackoverflow.com/a/65690669
 */
async function makeRequest<TResponse>(
  method: HTTP_METHOD,
  url: string,
  body?: any,
  optionOverrides?: RequestInit,
): Promise<TResponse> {
  const requestOptions = getRequestOptions(method, body, optionOverrides)
  const formattedUrl = formatUrl(url)
  const authStore = useAuthStore()
  const toastStore = useToastStore()
  const queryClient = getQueryClient()

  try {
    const response = await window.fetch(formattedUrl, requestOptions)
    const responseText = await response.text()
    const parsedResponse = responseText ? JSON.parse(responseText) : null

    if (response.ok) {
      return Promise.resolve(parsedResponse)
    }

    if (response.status === HTTP_STATUS_CODE.TOO_MANY_REQUESTS_429) {
      toastStore.createToast(parsedResponse?.detail, 'error')
      return Promise.reject(parsedResponse?.detail)
    }

    const authErrorStatusCodes = [HTTP_STATUS_CODE.UNAUTHORIZED_401, HTTP_STATUS_CODE.FORBIDDEN_403]
    if (authErrorStatusCodes.includes(response.status) && authStore.isLoggedIn) {
      queryClient.clear()
      await authStore.logout()
      return Promise.reject('Authentication error. Logging out...')
    }

    if (objectHasKey(parsedResponse, 'errors')) {
      return Promise.reject(parsedResponse.errors)
    }

    return Promise.reject(parsedResponse?.detail)
  } catch (err) {
    return Promise.reject(err)
  }
}

function makeRequestWithBody(method: HTTP_METHOD) {
  return <TResponse extends ApiResponse = never>(
    url: string,
    body?: any,
    optionOverrides?: RequestInit,
  ) => makeRequest<TResponse>(method, url, body, optionOverrides)
}

function makeRequestWithoutBody(method: HTTP_METHOD) {
  return <TResponse extends ApiResponse = never>(url: string, optionOverrides?: RequestInit) =>
    makeRequest<TResponse>(method, url, undefined, optionOverrides)
}

function makeNoContentRequest(method: HTTP_METHOD) {
  return (url: string, optionOverrides?: RequestInit) =>
    makeRequest<void>(method, url, undefined, optionOverrides)
}

export const apiClient = {
  get: makeRequestWithoutBody(HTTP_METHOD.GET),
  post: makeRequestWithBody(HTTP_METHOD.POST),
  patch: makeRequestWithBody(HTTP_METHOD.PATCH),
  put: makeRequestWithBody(HTTP_METHOD.PUT),
  delete: makeNoContentRequest(HTTP_METHOD.DELETE),
}

/**
 * Get options to pass to fetch().
 *
 * @param method
 * @param body
 * @param optionOverrides
 */
function getRequestOptions(
  method: string,
  body?: any,
  optionOverrides: RequestInit = {},
): RequestInit {
  const authStore = useAuthStore()

  const headers: HeadersInit = {
    ...(authStore.isLoggedIn && { Authorization: `Bearer ${authStore.jwtToken}` }),
    'Content-Type': MIME_TYPE.JSON,
    ...optionOverrides.headers,
  }

  const options: RequestInit = {
    method,
    ...optionOverrides,
    headers,
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  return options
}

/**
 * Remove leading forward slashes from a URL.
 *
 * @param url
 */
function formatUrl(url: string): string {
  const formatted = removePrefixCharacters(url, '/')
  return `/api/${formatted}`
}
