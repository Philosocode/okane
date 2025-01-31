<script setup lang="ts">
// Internal
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import { type FinanceRecordsSearchFilters } from '@features/financeRecords/types/searchFinanceRecords'

export type AppliedSortingProps = Pick<FinanceRecordsSearchFilters, 'sortDirection' | 'sortField'>

const props = defineProps<AppliedSortingProps>()
</script>

<template>
  <li>
    {{
      FINANCES_COPY.SEARCH_FILTERS.APPLIED_SORTING({
        sortDirection: props.sortDirection,
        sortField: props.sortField,
      })
    }}
  </li>
</template>
