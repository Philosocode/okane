// External
import type { InfiniteData } from '@tanstack/vue-query'
import type { APIPaginatedResponse } from '@shared/services/apiClient/types'

export function flattenPages<T>(pages?: APIPaginatedResponse<T>[]) {
  return pages?.flatMap((page) => page.items) ?? []
}

export function removeItemFromPage<TItem>(
  data: InfiniteData<APIPaginatedResponse<TItem>>,
  shouldIncludeItem: (item: TItem) => boolean,
): InfiniteData<APIPaginatedResponse<TItem>> {
  if (!Array.isArray(data.pages)) return data

  return {
    ...data,
    pages: data.pages.map((page) => {
      let totalItems = page.totalItems
      const filteredItems = page.items.filter(shouldIncludeItem)
      if (filteredItems.length != page.items.length) totalItems--

      return {
        ...page,
        totalItems,
        items: filteredItems,
      }
    }),
  }
}
