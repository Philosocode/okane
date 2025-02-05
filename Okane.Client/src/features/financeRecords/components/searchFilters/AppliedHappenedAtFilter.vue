<script setup lang="ts">
// Internal
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import { type FinanceRecordSearchFilters } from '@features/financeRecords/types/searchFilters'

export type AppliedHappenedAtFilterProps = Pick<
  FinanceRecordSearchFilters,
  'happenedAt1' | 'happenedAt2' | 'happenedAtOperator'
>

const props = defineProps<AppliedHappenedAtFilterProps>()
</script>

<template>
  <li v-if="props.happenedAtOperator && props.happenedAt1">
    {{
      FINANCES_COPY.SEARCH_FILTERS.APPLIED_HAPPENED_AT_AND_OPERATOR({
        happenedAt: props.happenedAt1,
        operator: props.happenedAtOperator,
      })
    }}
  </li>
  <li v-else-if="props.happenedAt1 && props.happenedAt2">
    {{
      FINANCES_COPY.SEARCH_FILTERS.APPLIED_HAPPENED_AT_RANGE({
        happenedAt1: props.happenedAt1,
        happenedAt2: props.happenedAt2,
      })
    }}
  </li>
</template>
