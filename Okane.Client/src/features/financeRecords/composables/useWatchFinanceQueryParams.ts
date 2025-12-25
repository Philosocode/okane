// External
import { useRoute } from 'vue-router'
import { ref, watchEffect } from 'vue'

// Internal
import { useFinanceRecordSearchStore } from '@features/financeRecords/composables/useFinanceRecordSearchStore'
import { useQueryFinanceUserTags } from '@features/financeUserTags/composables/useQueryFinanceUserTags'

import { mapLocationQueryToFinanceRecordSearchFilter } from '@features/financeRecords/utils/mappers'

/**
 * Composable to init state required for the finances page.
 */
export function useWatchFinanceQueryParams() {
  const route = useRoute()
  const parsedInitialQueryParams = ref(false)
  const userTagsQuery = useQueryFinanceUserTags()
  const searchStore = useFinanceRecordSearchStore()

  watchEffect(() => {
    const userTagMap = userTagsQuery.data.value
    if (!userTagMap) return

    const filters = mapLocationQueryToFinanceRecordSearchFilter(route.query, userTagMap)
    searchStore.setFilters(filters)

    if (!parsedInitialQueryParams.value) parsedInitialQueryParams.value = true
  })

  return {
    error: userTagsQuery.error,
    isLoading: userTagsQuery.isLoading || !parsedInitialQueryParams.value,
  }
}
