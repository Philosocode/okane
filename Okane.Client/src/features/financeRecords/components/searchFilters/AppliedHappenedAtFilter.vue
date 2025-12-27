<script setup lang="ts">
// Internal
import { FINANCES_SEARCH_FILTERS_COPY } from '@features/financeRecords/constants/searchFiltersCopy'

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
      FINANCES_SEARCH_FILTERS_COPY.APPLIED_HAPPENED_AT_AND_OPERATOR({
        happenedAt: props.happenedAt1,
        operator: props.happenedAtOperator,
      })
    }}
  </li>
  <li v-else-if="props.happenedAt1 && props.happenedAt2">
    {{
      FINANCES_SEARCH_FILTERS_COPY.APPLIED_HAPPENED_AT_RANGE({
        happenedAt1: props.happenedAt1,
        happenedAt2: props.happenedAt2,
      })
    }}
  </li>
</template>
