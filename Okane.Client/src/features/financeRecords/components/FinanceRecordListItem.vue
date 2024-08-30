<script setup lang="ts">
// External
import { formatDate } from 'date-fns'

// Internal
import { FINANCE_RECORD_TIMESTAMP_FORMAT } from '@features/financeRecords/constants/financeRecordList'

import type { FinanceRecord } from '@features/financeRecords/types/financeRecord'

type Props = {
  financeRecord: FinanceRecord
}

const props = defineProps<Props>()

const dateTime = formatDate(props.financeRecord.happenedAt, FINANCE_RECORD_TIMESTAMP_FORMAT)
</script>

<template>
  <div class="item">
    <div class="top-row">
      <span class="type">{{ props.financeRecord.type }}</span>
      -
      <span>{{ dateTime }} </span>
    </div>
    <div class="amount">${{ props.financeRecord.amount.toFixed(2) }}</div>
    <div>{{ props.financeRecord.description }}</div>
  </div>
</template>

<style scoped>
.amount {
  font-size: var(--font-size-xl);
}

.item {
  border: 1px solid var(--color-gray-500);
  display: flex;
  flex-direction: column;
  gap: var(--space-2xs);
  padding: var(--space-md);
}

.top-row {
  font-size: var(--font-size-xs);
}

.type {
  text-transform: uppercase;
}
</style>
