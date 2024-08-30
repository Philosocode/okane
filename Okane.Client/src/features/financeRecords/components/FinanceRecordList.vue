<script setup lang="ts">
// External
import { computed, inject } from 'vue'

// Internal
import FinanceRecordListItem from '@features/financeRecords/components/FinanceRecordListItem.vue'
import InfiniteScroller from '@shared/components/InfiniteScroller.vue'

import { useInfiniteQueryFinanceRecords } from '@features/financeRecords/composables/useInfiniteQueryFinanceRecords'

import { flattenPages } from '@shared/utils/response'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { FINANCE_RECORD_SEARCH_FILTERS_KEY } from '@features/financeRecords/constants/searchFilters'

const searchFilters = inject(FINANCE_RECORD_SEARCH_FILTERS_KEY)
const queryResult = useInfiniteQueryFinanceRecords(searchFilters)
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
</style>
