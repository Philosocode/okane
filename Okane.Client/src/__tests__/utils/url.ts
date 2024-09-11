// Internal
import { stripSearchParams } from '@shared/utils/url'

export function getMSWURL(url: string) {
  return stripSearchParams(`/api${url}`)
}
