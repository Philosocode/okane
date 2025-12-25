// External
import { type LocationQuery } from 'vue-router'

export function getQueryParamArray(key: string, query: LocationQuery): Array<string> {
  const value = query[key]
  if (!value) return []
  if (!Array.isArray(value)) return [value]
  return value.map((v) => v?.toString() ?? '')
}

export function getQueryParamValue(key: string, query: LocationQuery): string {
  const value = query[key]
  return typeof value === 'string' ? value : ''
}

export function stripSearchParams(url: string) {
  const questionIndex = url.indexOf('?')
  if (questionIndex === -1) return url
  return url.slice(0, questionIndex)
}
