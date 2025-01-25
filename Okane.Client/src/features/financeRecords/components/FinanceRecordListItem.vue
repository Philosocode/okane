<script setup lang="ts">
// External
import { computed, inject } from 'vue'
import { formatDate } from 'date-fns'

// Internal
import TagPill from '@shared/components/TagPill.vue'
import ToggleMenu from '@shared/components/ToggleMenu.vue'

import { FINANCE_RECORD_TIMESTAMP_FORMAT } from '@features/financeRecords/constants/financeRecordList'
import { SHARED_COPY } from '@shared/constants/copy'

import { type FinanceRecord } from '@features/financeRecords/types/financeRecord'

import {
  SAVE_FINANCE_RECORD_SYMBOL,
  type SaveFinanceRecordProvider,
} from '@features/financeRecords/providers/saveFinanceRecordProvider'

import {
  DELETE_FINANCE_RECORD_ID_SYMBOL,
  type DeleteFinanceRecordIdProvider,
} from '@features/financeRecords/providers/deleteFinanceRecordIdProvider'

type Props = {
  financeRecord: FinanceRecord
}

const { financeRecord } = defineProps<Props>()

const dateTime = computed(() =>
  formatDate(financeRecord.happenedAt, FINANCE_RECORD_TIMESTAMP_FORMAT),
)

const deleteProvider = inject(DELETE_FINANCE_RECORD_ID_SYMBOL) as DeleteFinanceRecordIdProvider
const saveProvider = inject(SAVE_FINANCE_RECORD_SYMBOL) as SaveFinanceRecordProvider

function handleEdit() {
  saveProvider.setEditingFinanceRecord({ ...financeRecord })
}

function handleDelete() {
  deleteProvider.setId(financeRecord.id)
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

      <div class="tags">
        <TagPill :key="tag.id" v-for="tag in financeRecord.tags" :tag-name="tag.name" />
      </div>
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
  display: flex;
  flex-direction: column;
  gap: var(--space-2xs);
  padding: var(--space-md);
}

.item {
  border: pxToRem(1) solid var(--color-card-border);
  display: flex;
  justify-content: space-between;
}

.tags {
  display: flex;
  gap: var(--space-xs);
}

.top-row {
  font-size: var(--font-size-xs);
}

.type {
  text-transform: uppercase;
}
</style>
