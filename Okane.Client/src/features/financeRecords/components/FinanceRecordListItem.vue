<script setup lang="ts">
// External
import { format } from 'date-fns'
import { inject } from 'vue'

// Internal
import FinanceRecordTags from '@features/financeRecords/components/financeRecordList/FinanceRecordTags.vue'
import FinanceRecordTypePill from '@features/financeRecords/components/financeRecordList/FinanceRecordTypePill.vue'
import Kicker from '@shared/components/typography/Kicker.vue'
import ToggleMenu from '@shared/components/ToggleMenu.vue'
import VerticalDivider from '@shared/components/VerticalDivider.vue'

import { COMMON_DATE_TIME_FORMAT } from '@shared/constants/dateTime'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { SHARED_COPY } from '@shared/constants/copy'

import { type FinanceRecord } from '@features/financeRecords/types/financeRecord'

import {
  SAVE_FINANCE_RECORD_SYMBOL,
  type SaveFinanceRecordProvider,
} from '@features/financeRecords/providers/saveFinanceRecordProvider'

import {
  DELETE_FINANCE_RECORD_SYMBOL,
  type DeleteFinanceRecordProvider,
} from '@features/financeRecords/providers/deleteFinanceRecordProvider'

export type FinanceRecordListItemProps = {
  financeRecord: FinanceRecord
}

const { financeRecord } = defineProps<FinanceRecordListItemProps>()

const deleteProvider = inject(DELETE_FINANCE_RECORD_SYMBOL) as DeleteFinanceRecordProvider
const saveProvider = inject(SAVE_FINANCE_RECORD_SYMBOL) as SaveFinanceRecordProvider

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

function handleEdit() {
  saveProvider.setFinanceRecordToEdit({ ...financeRecord })
}

function handleDelete() {
  deleteProvider.setFinanceRecordToDelete(financeRecord)
}
</script>

<template>
  <li class="grid">
    <Kicker class="dateTime">{{
      format(financeRecord.happenedAt, COMMON_DATE_TIME_FORMAT)
    }}</Kicker>

    <ToggleMenu
      :actions="menuActions"
      class="toggle-menu"
      :menu-id="`toggle-menu-${financeRecord.id}`"
      is-showing
    />

    <div class="amount">
      {{ FINANCES_COPY.MONEY({ amount: financeRecord.amount, type: financeRecord.type }) }}
    </div>
    <p class="description">{{ financeRecord.description }}</p>

    <div class="tags">
      <FinanceRecordTypePill :type="financeRecord.type" />
      <VerticalDivider v-if="financeRecord.tags.length > 0" />
      <FinanceRecordTags :tags="financeRecord.tags" />
    </div>
  </li>
</template>

<style scoped lang="scss">
.grid {
  align-items: center;
  column-gap: var(--space-sm);
  display: grid;
  grid-template-columns: max-content 1fr;
  padding: var(--space-xs) var(--space-xs);
  position: relative;
  row-gap: var(--space-xs);

  &:not(:first-child) {
    border-top: var(--border-main);
  }

  @include respond(sm) {
    padding: var(--space-sm) var(--space-md);
    row-gap: var(--space-sm);
  }
}

.amount {
  grid-column: 1 / -1;
  font-size: var(--font-size-xl);
  position: relative;

  @include respond(sm) {
    grid-column: auto;
  }
}

.dateTime {
  font-size: var(--font-size-sm);
  grid-column: 1 / -1;
}

.description {
  font-size: var(--font-size-md);
  grid-column: 1 / -1;

  @include truncate(2);
  @include respond(sm) {
    grid-column: auto;
  }
}

.tags {
  display: flex;
  gap: var(--space-md);
  grid-column: 1 / -1;

  @include respond(sm) {
    margin-block-start: 0;
  }
}

.toggle-menu {
  position: absolute;
  top: var(--space-2xs);
  right: var(--space-2xs);
}
</style>
