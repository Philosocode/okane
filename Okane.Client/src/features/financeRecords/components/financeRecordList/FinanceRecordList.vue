<script setup lang="ts">
// External
import { computed } from 'vue'

// Internal
import FinanceRecordListItem from '@features/financeRecords/components/financeRecordList/FinanceRecordListItem.vue'
import InfiniteScroller from '@shared/components/InfiniteScroller.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { SHARED_COPY } from '@shared/constants/copy'

import { useInfiniteQueryFinanceRecords } from '@features/financeRecords/composables/useInfiniteQueryFinanceRecords'

import { flattenPages } from '@shared/utils/pagination'

const queryResult = useInfiniteQueryFinanceRecords()
const financeRecords = computed(() => flattenPages(queryResult.data.value?.pages))
</script>

<template>
  <InfiniteScroller :items="financeRecords" :query-result="queryResult">
    <ul class="card finance-record-list">
      <FinanceRecordListItem
        v-for="financeRecord in financeRecords"
        :key="financeRecord.id"
        :finance-record="financeRecord"
      />
    </ul>

    <template #noItems>
      <p class="no-items">{{ FINANCES_COPY.INFINITE_LIST.NO_FINANCE_RECORDS }}</p>
    </template>

    <template #noMoreItems>
      <p class="no-items">{{ SHARED_COPY.INFINITE_SCROLLER.REACHED_THE_BOTTOM }}</p>
    </template>
  </InfiniteScroller>
</template>

<style scoped>
.finance-record-list {
  border: var(--border-main);
  display: flex;
  flex-direction: column;
}

.no-items {
  margin-top: var(--space-xl);
  text-align: center;
}
</style>
