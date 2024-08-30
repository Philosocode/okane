<script setup lang="ts">
// External
import { formatDate } from 'date-fns'

// Internal
import ToggleMenu from '@shared/components/ToggleMenu.vue'

import { FINANCE_RECORD_TIMESTAMP_FORMAT } from '@features/financeRecords/constants/financeRecordList'

import type { FinanceRecord } from '@features/financeRecords/types/financeRecord'

type Props = {
  financeRecord: FinanceRecord
}

const props = defineProps<Props>()

const dateTime = formatDate(props.financeRecord.happenedAt, FINANCE_RECORD_TIMESTAMP_FORMAT)
const menuActions = [
  {
    onClick: () => console.log('Edit'),
    text: 'Edit',
  },
  {
    onClick: () => console.log('Delete'),
    text: 'Delete',
  },
]
</script>

<template>
  <div class="item">
    <div class="content">
      <div class="top-row">
        <span class="type">{{ props.financeRecord.type }}</span>
        -
        <span>{{ dateTime }} </span>
      </div>
      <div class="amount">${{ props.financeRecord.amount.toFixed(2) }}</div>
      <div>{{ props.financeRecord.description }}</div>
    </div>

    <div class="menu-container">
      <ToggleMenu :actions="menuActions" is-showing />
    </div>
  </div>
</template>

<style scoped lang="scss">
.amount {
  font-size: var(--font-size-xl);
}

.content {
  gap: var(--space-2xs);
  padding: var(--space-md);
}

.item {
  border: pxToRem(1) solid var(--color-gray-500);
  display: flex;
  justify-content: space-between;
}

.top-row {
  font-size: var(--font-size-xs);
}

.type {
  text-transform: uppercase;
}
</style>
