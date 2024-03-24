// Internal
import { HTTPMethod, HTTPStatusCode, MIMEType } from '@/shared/constants/http.constants'

import { useAuthStore } from '@/features/auth/useAuthStore'

import { removePrefixCharacters } from '@/shared/utils/string.utils'
import type { APIResponse } from '@/shared/services/apiClient/apiClient.types'

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
  method: HTTPMethod,
  url: string,
  body?: any,
  optionOverrides?: RequestInit,
): Promise<TResponse> {
  const requestOptions = getRequestOptions(method, body, optionOverrides)
  const formattedURL = formatURL(url)
  const authStore = useAuthStore()

  try {
    const response = await window.fetch(formattedURL, requestOptions)
    const responseText = await response.text()
    const parsedResponse = responseText ? JSON.parse(responseText) : null

    if (response.ok) {
      return Promise.resolve(parsedResponse)
    }

    const authErrorStatusCodes = [HTTPStatusCode.Unauthorized, HTTPStatusCode.Forbidden]
    if (authErrorStatusCodes.includes(response.status) && authStore.isLoggedIn) {
      await authStore.logout()
      return Promise.reject('Authentication error. Logging out...')
    }

    return Promise.reject(parsedResponse?.errors)
  } catch (err) {
    return Promise.reject(err)
  }
}

function makeRequestWithBody(method: HTTPMethod) {
  return <TResponse extends APIResponse = never>(
    url: string,
    body?: any,
    optionOverrides?: RequestInit,
  ) => makeRequest<TResponse>(method, url, body, optionOverrides)
}

function makeRequestWithoutBody(method: HTTPMethod) {
  return <TResponse extends APIResponse = never>(url: string, optionOverrides?: RequestInit) =>
    makeRequest<TResponse>(method, url, undefined, optionOverrides)
}

export const apiClient = {
  get: makeRequestWithoutBody(HTTPMethod.GET),
  post: makeRequestWithBody(HTTPMethod.POST),
  patch: makeRequestWithBody(HTTPMethod.PATCH),
  put: makeRequestWithBody(HTTPMethod.PUT),
  delete: makeRequestWithoutBody(HTTPMethod.DELETE),
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
    'Content-Type': MIMEType.JSON,
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
