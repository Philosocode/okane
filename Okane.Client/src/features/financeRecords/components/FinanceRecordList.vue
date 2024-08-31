<script setup lang="ts">
// External
import { computed, inject, ref } from 'vue'

// Internal
import DeleteFinanceRecordModal from '@features/financeRecords/components/DeleteFinanceRecordModal.vue'
import FinanceRecordListItem from '@features/financeRecords/components/FinanceRecordListItem.vue'
import InfiniteScroller from '@shared/components/InfiniteScroller.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { FINANCE_RECORD_SEARCH_FILTERS_KEY } from '@features/financeRecords/constants/searchFilters'

import { useInfiniteQueryFinanceRecords } from '@features/financeRecords/composables/useInfiniteQueryFinanceRecords'

import { flattenPages } from '@shared/utils/pagination'

const searchFilters = inject(FINANCE_RECORD_SEARCH_FILTERS_KEY)
const queryResult = useInfiniteQueryFinanceRecords(searchFilters)
const financeRecords = computed(() => flattenPages(queryResult.data.value?.pages))

const deleteFinanceRecordId = ref<number>()

function handleStartDelete(id: number) {
  deleteFinanceRecordId.value = id
}
</script>

<template>
  <div class="root">
    <InfiniteScroller :items="financeRecords" :query-result="queryResult">
      <ul class="finance-record-list">
        <li v-for="financeRecord in financeRecords" :key="financeRecord.id">
          <FinanceRecordListItem @delete="handleStartDelete" :finance-record="financeRecord" />
        </li>
      </ul>

      <template #noItems>
        <p>{{ FINANCES_COPY.INFINITE_LIST.NO_FINANCE_RECORDS }}</p>
      </template>
    </InfiniteScroller>
  </div>

  <DeleteFinanceRecordModal
    :finance-record-id="deleteFinanceRecordId"
    @close="deleteFinanceRecordId = undefined"
  />
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
