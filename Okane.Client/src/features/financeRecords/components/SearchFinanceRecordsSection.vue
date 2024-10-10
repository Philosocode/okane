<script setup lang="ts">
// External
import { inject } from 'vue'

// Internal
import SearchFinanceRecordsModal from '@features/financeRecords/components/SearchFinanceRecordsModal.vue'
import SearchFinanceRecordsSummary from '@features/financeRecords/components/SearchFinanceRecordsSummary.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import {
  SEARCH_FINANCE_RECORDS_SYMBOL,
  type SearchFinanceRecordsProvider,
} from '@features/financeRecords/providers/searchFinanceRecordsProvider'

const searchProvider = inject(SEARCH_FINANCE_RECORDS_SYMBOL) as SearchFinanceRecordsProvider
</script>

<template>
  <div>
    <SearchFinanceRecordsSummary />

    <button @click="searchProvider.setModalIsShowing(true)" class="edit-button">
      {{ FINANCES_COPY.SEARCH_FINANCE_RECORDS_MODAL.EDIT_SEARCH_FILTERS }}
    </button>

    <SearchFinanceRecordsModal />
  </div>
</template>

<style scoped>
.edit-button {
  margin-top: var(--space-sm);
}
</style>
