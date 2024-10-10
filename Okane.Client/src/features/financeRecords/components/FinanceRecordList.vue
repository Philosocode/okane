<script setup lang="ts">
// External
import { computed, inject } from 'vue'

// Internal
import FinanceRecordListItem from '@features/financeRecords/components/FinanceRecordListItem.vue'
import InfiniteScroller from '@shared/components/InfiniteScroller.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { SHARED_COPY } from '@shared/constants/copy'

import { useInfiniteQueryFinanceRecords } from '@features/financeRecords/composables/useInfiniteQueryFinanceRecords'

import {
  SEARCH_FINANCE_RECORDS_SYMBOL,
  type SearchFinanceRecordsProvider,
} from '@features/financeRecords/providers/searchFinanceRecordsProvider'

import { flattenPages } from '@shared/utils/pagination'

const searchProvider = inject(SEARCH_FINANCE_RECORDS_SYMBOL) as SearchFinanceRecordsProvider
const queryResult = useInfiniteQueryFinanceRecords(() => searchProvider.filters)
const financeRecords = computed(() => flattenPages(queryResult.data.value?.pages))
</script>

<template>
  <div class="root">
    <InfiniteScroller :items="financeRecords" :query-result="queryResult">
      <ul class="finance-record-list">
        <li v-for="financeRecord in financeRecords" :key="financeRecord.id">
          <FinanceRecordListItem :finance-record="financeRecord" />
        </li>
      </ul>

      <template #noItems>
        <p>{{ FINANCES_COPY.INFINITE_LIST.NO_FINANCE_RECORDS }}</p>
      </template>

      <template #noMoreItems>
        <p class="no-more-items">{{ SHARED_COPY.INFINITE_SCROLLER.REACHED_THE_BOTTOM }}</p>
      </template>
    </InfiniteScroller>
  </div>
</template>

<style scoped>
.root {
  margin-top: var(--space-lg);
}

.finance-record-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.no-more-items {
  color: var(--color-gray-300);
  margin-block: var(--space-xl);
  text-align: center;
}
</style>
