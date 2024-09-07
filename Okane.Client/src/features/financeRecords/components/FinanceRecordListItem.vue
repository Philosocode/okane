<script setup lang="ts">
// External
import { formatDate } from 'date-fns'
import { inject } from 'vue'

// Internal
import ToggleMenu from '@shared/components/ToggleMenu.vue'

import { FINANCE_RECORD_TIMESTAMP_FORMAT } from '@features/financeRecords/constants/financeRecordList'
import { SET_EDITING_FINANCE_RECORD_KEY } from '@features/financeRecords/constants/saveFinanceRecord'
import { SHARED_COPY } from '@shared/constants/copy'

import type { FinanceRecord } from '@features/financeRecords/types/financeRecord'

type Props = {
  financeRecord: FinanceRecord
}

const { financeRecord } = defineProps<Props>()

const emit = defineEmits<{
  (e: 'delete', id: number): void
}>()

const setEditingFinanceRecord = inject(SET_EDITING_FINANCE_RECORD_KEY, () => {})

const dateTime = formatDate(financeRecord.happenedAt, FINANCE_RECORD_TIMESTAMP_FORMAT)

function handleEdit() {
  setEditingFinanceRecord({ ...financeRecord })
}

function handleDelete() {
  emit('delete', financeRecord.id)
}

const menuActions = [
  {
    onClick: handleEdit,
    text: SHARED_COPY.ACTIONS.EDIT,
  },
  {
    onClick: handleDelete,
    text: SHARED_COPY.ACTIONS.DELETE,
  },
]
</script>

<template>
  <div class="item">
    <div class="content">
      <div class="top-row">
        <span class="type">{{ financeRecord.type }}</span>
        -
        <span>{{ dateTime }} </span>
      </div>
      <div class="amount">${{ financeRecord.amount.toFixed(2) }}</div>
      <div>{{ financeRecord.description }}</div>
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
