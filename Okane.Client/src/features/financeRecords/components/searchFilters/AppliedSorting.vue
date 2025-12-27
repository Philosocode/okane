<script setup lang="ts">
// Internal
import { FINANCES_SEARCH_FILTERS_COPY } from '@features/financeRecords/constants/searchFiltersCopy'

import { type FinanceRecordSearchFilters } from '@features/financeRecords/types/searchFilters'

export type AppliedSortingProps = Pick<FinanceRecordSearchFilters, 'sortDirection' | 'sortField'>

const props = defineProps<AppliedSortingProps>()
</script>

<template>
  <li>
    {{
      FINANCES_SEARCH_FILTERS_COPY.APPLIED_SORTING({
        sortDirection: props.sortDirection,
        sortField: props.sortField,
      })
    }}
  </li>
</template>
