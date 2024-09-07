// External
import { onUnmounted, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { useQueryClient, type InfiniteData, type QueryKey } from '@tanstack/vue-query'

/**
 * Remove pages from an infinite query. Vue Query's default behaviour is to re-fetch all pages on background re-fetches.
 * However, this isn't always desirable, so we can limit the # pages re-fetched using this composable.
 *
 * @param queryKey
 * @param pagesToKeep
 */
export function useCleanUpInfiniteQuery(queryKey: MaybeRefOrGetter<QueryKey>, pagesToKeep = 1) {
  const queryClient = useQueryClient()

  // Cleanup excess pages when the query key changes or on unmount.
  function cleanUpExcessPages(keyToCleanUp: QueryKey) {
    queryClient.setQueryData<InfiniteData<unknown>>(keyToCleanUp, (data) => {
      if (!data || !Array.isArray(data.pages) || !Array.isArray(data.pageParams)) return data

      return {
        ...data,
        pages: data.pages.slice(0, pagesToKeep),
        pageParams: data.pageParams.slice(0, pagesToKeep),
      }
    })
  }

  watch(queryKey, (_, oldKey) => {
    cleanUpExcessPages(toValue(oldKey))
  })

  onUnmounted(() => cleanUpExcessPages(toValue(queryKey)))
}
