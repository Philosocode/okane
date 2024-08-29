// Internal
import { HTTP_METHOD, HTTP_STATUS_CODE, MIME_TYPE } from '@shared/constants/http'

import type { APIResponse } from '@shared/services/apiClient/types'

import { useAuthStore } from '@features/auth/composables/useAuthStore'

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
async function makeRequest<TResponse extends APIResponse = never>(
  method: HTTP_METHOD,
  url: string,
  body?: any,
  optionOverrides?: RequestInit,
): Promise<TResponse> {
  const requestOptions = getRequestOptions(method, body, optionOverrides)
  const formattedURL = formatURL(url)
  const authStore = useAuthStore()
  const queryClient = getQueryClient()

  try {
    const response = await window.fetch(formattedURL, requestOptions)
    const responseText = await response.text()
    const parsedResponse = responseText ? JSON.parse(responseText) : null

    if (response.ok) {
      return Promise.resolve(parsedResponse)
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
  return <TResponse extends APIResponse = never>(
    url: string,
    body?: any,
    optionOverrides?: RequestInit,
  ) => makeRequest<TResponse>(method, url, body, optionOverrides)
}

function makeRequestWithoutBody(method: HTTP_METHOD) {
  return <TResponse extends APIResponse = never>(url: string, optionOverrides?: RequestInit) =>
    makeRequest<TResponse>(method, url, undefined, optionOverrides)
}

export const apiClient = {
  get: makeRequestWithoutBody(HTTP_METHOD.GET),
  post: makeRequestWithBody(HTTP_METHOD.POST),
  patch: makeRequestWithBody(HTTP_METHOD.PATCH),
  put: makeRequestWithBody(HTTP_METHOD.PUT),
  delete: makeRequestWithoutBody(HTTP_METHOD.DELETE),
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
  const headers: HeadersInit = {
    'Content-Type': MIME_TYPE.JSON,
  }

  const authStore = useAuthStore()
  if (authStore.isLoggedIn) {
    headers.Authorization = `Bearer ${authStore.jwtToken}`
  }

  const options: RequestInit = {
    method,
    headers,
    ...optionOverrides,
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
function formatURL(url: string): string {
  const formattedURL = removePrefixCharacters(url, '/')
  return `/api/${formattedURL}`
}
