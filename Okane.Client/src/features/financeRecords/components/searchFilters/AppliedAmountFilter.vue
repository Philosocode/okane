<script setup lang="ts">
// Internal
import { FINANCES_SEARCH_FILTERS_COPY } from '@features/financeRecords/constants/searchFiltersCopy'

import { type FinanceRecordSearchFilters } from '@features/financeRecords/types/searchFilters'

export type AppliedAmountFilterProps = Pick<
  FinanceRecordSearchFilters,
  'amount1' | 'amount2' | 'amountOperator'
>

const props = defineProps<AppliedAmountFilterProps>()
</script>

<template>
  <li v-if="props.amountOperator && props.amount1">
    {{
      FINANCES_SEARCH_FILTERS_COPY.APPLIED_AMOUNT_AND_OPERATOR({
        amount: props.amount1,
        operator: props.amountOperator,
      })
    }}
  </li>
  <li v-else-if="props.amount1 && props.amount2">
    {{
      FINANCES_SEARCH_FILTERS_COPY.APPLIED_AMOUNT_RANGE({
        amount1: props.amount1,
        amount2: props.amount2,
      })
    }}
  </li>
</template>
