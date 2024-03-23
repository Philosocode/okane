// Internal
import { HTTPMethod, HTTPStatusCode, MIMEType } from '@/shared/constants/http.constants'

import { useAuthStore } from '@/features/auth/useAuthStore'

import { removePrefixCharacters } from '@/shared/utils/string.utils'

export interface APIResponse<TItem = unknown> {
  items: TItem[]
  status: number
}

export interface APIPaginatedResponse extends APIResponse {
  currentPage: number
  hasNextPage: boolean
  pageSize: number
  totalItems: number
}

// See: https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.problemdetails?view=aspnetcore-8.0#properties
export interface ProblemDetailsResponse {
  status: number

  // Short, human-readable summary of the problem. Should be consistent across instances of the problem.
  title: string

  // URI identifying the problem type.
  type: string

  // Dictionary where keys are property names and values are the errors associated with the
  // property name.
  errors?: Record<string, string[]>

  // URI identifying the specific occurrence of the problem.
  instance?: string
}

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
