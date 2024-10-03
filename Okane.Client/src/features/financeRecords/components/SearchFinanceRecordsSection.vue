<script setup lang="ts">
// Internal
import SearchFinanceRecordsModal from '@features/financeRecords/components/SearchFinanceRecordsModal.vue'
import SearchFinanceRecordsSummary from '@features/financeRecords/components/SearchFinanceRecordsSummary.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import { useSearchFinanceRecordsStore } from '@features/financeRecords/composables/useSearchFinanceRecordsStore'

const searchStore = useSearchFinanceRecordsStore()
</script>

<template>
  <div>
    <SearchFinanceRecordsSummary />

    <button @click="searchStore.setModalIsShowing(true)" class="edit-button">
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
