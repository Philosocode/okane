// Internal
import { HTTPMethod, HTTPStatusCode, MIMEType } from '@/shared/constants/http.constants'

import { useAuthStore } from '@/features/auth/useAuthStore'

import { removePrefixCharacters } from '@/shared/utils/string.utils'

export interface APIResponse<TItem = unknown> {
  errors: APIError[]
  hasErrors: boolean
  items: TItem[]
}

type APIError = {
  message: string
  key?: string
}

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
export async function apiClient<TResponse>(
  method: HTTPMethod,
  url: string,
  optionOverrides: RequestInit = {},
): Promise<TResponse> {
  const requestOptions = getRequestOptions(method, optionOverrides)
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

apiClient.get = <TResponse>(url: string, customConfig?: RequestInit) =>
  apiClient<TResponse>(HTTPMethod.GET, url, customConfig)

apiClient.post = <TResponse>(url: string, body?: any, customConfig?: RequestInit) =>
  apiClient<TResponse>(HTTPMethod.POST, url, { ...customConfig, body })

apiClient.put = <TResponse>(url: string, body?: any, customConfig?: RequestInit) =>
  apiClient<TResponse>(HTTPMethod.PUT, url, { ...customConfig, body })

apiClient.patch = <TResponse>(url: string, body: BodyInit | null, customConfig?: RequestInit) =>
  apiClient<TResponse>(HTTPMethod.PATCH, url, { ...customConfig, body })

apiClient.delete = <TResponse>(url: string, customConfig?: RequestInit) =>
  apiClient<TResponse>(HTTPMethod.DELETE, url, customConfig)

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
