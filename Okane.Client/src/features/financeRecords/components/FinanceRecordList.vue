<script setup lang="ts">
// External
import { computed } from 'vue'

// Internal
import FinanceRecordListItem from '@features/financeRecords/components/FinanceRecordListItem.vue'
import InfiniteScroller from '@shared/components/InfiniteScroller.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { SHARED_COPY } from '@shared/constants/copy'

import { useInfiniteQueryFinanceRecords } from '@features/financeRecords/composables/useInfiniteQueryFinanceRecords'
import { useSearchFinanceRecordsStore } from '@features/financeRecords/composables/useSearchFinanceRecordsStore'

import { flattenPages } from '@shared/utils/pagination'

const searchStore = useSearchFinanceRecordsStore()
const queryResult = useInfiniteQueryFinanceRecords(() => searchStore.searchFilters)
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
