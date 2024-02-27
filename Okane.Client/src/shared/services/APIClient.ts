// Internal
import { isErrorWithMessage } from '@/shared/utils/errorUtils'

enum MIMEType {
  JSON = 'application/json',
}

enum HTTPMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

/**
 * Custom wrapper around the Fetch API.
 *
 * @param endpoint
 * @param options
 *
 * @see https://kentcdodds.com/blog/replace-axios-with-a-simple-custom-fetch-wrapper
 * @see https://stackoverflow.com/a/65690669
 */
async function APIClient<TResponse>(endpoint: string, options?: RequestInit): Promise<TResponse> {
  const { body, ...customConfig } = options ?? {}

  const config: RequestInit = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      'Content-Type': MIMEType.JSON,
      ...customConfig.headers,
    },
  }

  if (body) config.body = JSON.stringify(body)

  let data
  try {
    const url = `/api/${formatEndpoint(endpoint)}`
    const response = await window.fetch(url, config)

    data = await response.json()

    if (response.ok) return data
    throw new Error(response.statusText)
  } catch (err) {
    return Promise.reject(isErrorWithMessage(err) ? err.message : data)
  }
}

function formatEndpoint(endpoint: string) {
  return endpoint.startsWith('/') ? endpoint.substring(1) : endpoint
}

APIClient.get = <TResponse>(endpoint: string, customConfig?: RequestInit) =>
  APIClient<TResponse>(endpoint, { ...customConfig, method: HTTPMethod.GET })

APIClient.post = <TResponse>(endpoint: string, body: BodyInit | null, customConfig?: RequestInit) =>
  APIClient<TResponse>(endpoint, { ...customConfig, body, method: HTTPMethod.POST })

APIClient.put = <TResponse>(endpoint: string, body: BodyInit | null, customConfig?: RequestInit) =>
  APIClient<TResponse>(endpoint, { ...customConfig, body, method: HTTPMethod.PUT })

APIClient.patch = <TResponse>(endpoint: string, body: BodyInit | null, customConfig?: RequestInit) =>
  APIClient<TResponse>(endpoint, { ...customConfig, body, method: HTTPMethod.PATCH })

APIClient.delete = <TResponse>(endpoint: string, customConfig?: RequestInit) =>
  APIClient<TResponse>(endpoint, { ...customConfig, method: HTTPMethod.DELETE })

export { APIClient }
