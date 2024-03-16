// Internal
import { HTTPMethod, HTTPStatusCode, MIMEType } from '@/shared/constants/requests'

import { useAuthStore } from '@/features/auth/stores/useAuthStore'

import { removePrefixCharacters } from '@/shared/utils/stringUtils'

/**
 * Custom wrapper around the Fetch API.
 *
 * @param method
 * @param url
 * @param optionOverrides
 *
 * @see https://jasonwatmore.com/vue-3-pinia-jwt-authentication-with-refresh-tokens-example-tutorial
 * @see https://stackoverflow.com/a/65690669
 */
export async function APIClient<TResponse>(
  method: HTTPMethod,
  url: string,
  optionOverrides: RequestInit = {},
): Promise<TResponse> {
  const requestOptions = getRequestOptions(method, optionOverrides)
  const formattedURL = formatURL(url)
  const authStore = useAuthStore()

  try {
    const response = await window.fetch(formattedURL, requestOptions)

    const authErrorStatusCodes = [HTTPStatusCode.Unauthorized, HTTPStatusCode.Forbidden]
    if (authErrorStatusCodes.includes(response.status) && authStore.isLoggedIn) {
      authStore.logout()
      return Promise.reject('Unauthenticated.')
    }

    const responseText = await response.text()
    return responseText ? JSON.parse(responseText) : null
  } catch (err) {
    return Promise.reject(err)
  }
}

APIClient.get = <TResponse>(url: string, customConfig?: RequestInit) =>
  APIClient<TResponse>(HTTPMethod.GET, url, customConfig)

APIClient.post = <TResponse>(url: string, body?: any, customConfig?: RequestInit) =>
  APIClient<TResponse>(HTTPMethod.POST, url, { ...customConfig, body })

APIClient.put = <TResponse>(url: string, body?: any, customConfig?: RequestInit) =>
  APIClient<TResponse>(HTTPMethod.PUT, url, { ...customConfig, body })

APIClient.patch = <TResponse>(url: string, body: BodyInit | null, customConfig?: RequestInit) =>
  APIClient<TResponse>(HTTPMethod.PATCH, url, { ...customConfig, body })

APIClient.delete = <TResponse>(url: string, customConfig?: RequestInit) =>
  APIClient<TResponse>(HTTPMethod.DELETE, url, customConfig)

/**
 * Get options to pass to fetch().
 *
 * @param method
 * @param optionOverrides
 */
function getRequestOptions(method: HTTPMethod, optionOverrides: RequestInit): RequestInit {
  const authStore = useAuthStore()
  const { body, ...overrides } = optionOverrides

  const headers: HeadersInit = {
    'Content-Type': MIMEType.JSON,
  }

  if (authStore.isLoggedIn) {
    headers.Authorization = `Bearer ${authStore.jwtToken}`
  }

  const options: RequestInit = {
    method,
    headers,
    ...overrides,
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
