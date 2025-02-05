// Internal
import { stripSearchParams } from '@shared/utils/url'

export function getMswUrl(url: string) {
  return stripSearchParams(`/api${url}`)
}
