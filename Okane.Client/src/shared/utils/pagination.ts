// External
import type { InfiniteData } from '@tanstack/vue-query'

// Internal
import type { APIPaginatedResponse } from '@shared/services/apiClient/types'

export function flattenPages<T>(pages?: APIPaginatedResponse<T>[]) {
  return pages?.flatMap((page) => page.items) ?? []
}

/**
 * Remove an item from paginated data where `shouldIncludeItem` returns true.
 *
 * @param data
 * @param shouldIncludeItem
 */
export function removeItemFromPages<TItem>(
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
