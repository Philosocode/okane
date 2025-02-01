<script setup lang="ts">
// Internal
import CardHeading from '@shared/components/typography/CardHeading.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import { type FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'

import { pluralize } from '@shared/utils/string'

export type TotalAmountCellProps = {
  amount: number
  count: number
  headingText: string
  loading: boolean
  type: FINANCE_RECORD_TYPE
}

const props = defineProps<TotalAmountCellProps>()
</script>

<template>
  <div class="cell flow">
    <CardHeading tag="h3">{{ props.headingText }}</CardHeading>
    <p class="amount" :class="{ hidden: props.loading }">
      {{ FINANCES_COPY.STATS.TOTAL_AMOUNT({ amount: props.amount, type: props.type }) }}
    </p>
    <p>
      {{ props.count }}
      {{ pluralize({ text: FINANCES_COPY.STATS.RECORD, count: props.count, suffix: 's' }) }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.cell {
  flex: 1;
  padding: var(--space-lg) var(--space-2xs);
  text-align: center;

  --flow-space: var(--space-xs);
}

.amount {
  font-size: var(--font-size-xl);
  font-weight: bold;
  word-break: break-all;
}

.hidden {
  visibility: hidden;
}
</style>
