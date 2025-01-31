<script setup lang="ts">
// Internal
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import { type FinanceRecordsSearchFilters } from '@features/financeRecords/types/searchFinanceRecords'

export type AppliedAmountFilterProps = Pick<
  FinanceRecordsSearchFilters,
  'amount1' | 'amount2' | 'amountOperator'
>

const props = defineProps<AppliedAmountFilterProps>()
</script>

<template>
  <li v-if="props.amountOperator && props.amount1">
    {{
      FINANCES_COPY.SEARCH_FILTERS.APPLIED_AMOUNT_AND_OPERATOR({
        amount: props.amount1,
        operator: props.amountOperator,
      })
    }}
  </li>
  <li v-else-if="props.amount1 && props.amount2">
    {{
      FINANCES_COPY.SEARCH_FILTERS.APPLIED_AMOUNT_RANGE({
        amount1: props.amount1,
        amount2: props.amount2,
      })
    }}
  </li>
</template>
