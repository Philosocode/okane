<script setup lang="ts">
// External
import { formatDate } from 'date-fns'

// Internal
import ToggleMenu from '@shared/components/ToggleMenu.vue'

import { FINANCE_RECORD_TIMESTAMP_FORMAT } from '@features/financeRecords/constants/financeRecordList'
import { SHARED_COPY } from '@shared/constants/copy'

import type { FinanceRecord } from '@features/financeRecords/types/financeRecord'

import { useDeleteFinanceRecordStore } from '@features/financeRecords/composables/useDeleteFinanceRecordStore'
import { useSaveFinanceRecordStore } from '@features/financeRecords/composables/useSaveFinanceRecordStore'
import { computed } from 'vue'

type Props = {
  financeRecord: FinanceRecord
}

const { financeRecord } = defineProps<Props>()

const dateTime = computed(() =>
  formatDate(financeRecord.happenedAt, FINANCE_RECORD_TIMESTAMP_FORMAT),
)

const saveStore = useSaveFinanceRecordStore()
const deleteStore = useDeleteFinanceRecordStore()

function handleEdit() {
  saveStore.setEditingFinanceRecord({ ...financeRecord })
}

function handleDelete() {
  deleteStore.setDeletingFinanceRecordId(financeRecord.id)
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
      <ToggleMenu :actions="menuActions" :menu-id="`toggle-menu-${financeRecord.id}`" is-showing />
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
