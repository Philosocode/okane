<script setup lang="ts">
// External
import { inject } from 'vue'

// Internal
import AppliedSearchFilters from '@features/financeRecords/components/searchFinanceRecords/AppliedSearchFilters.vue'
import ModalTrigger from '@shared/components/modal/ModalTrigger.vue'
import SearchFiltersModal from '@features/financeRecords/components/searchFinanceRecords/SearchFiltersModal.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import {
  SEARCH_FINANCE_RECORDS_SYMBOL,
  type SearchFinanceRecordsProvider,
} from '@features/financeRecords/providers/searchFinanceRecordsProvider'

const searchProvider = inject(SEARCH_FINANCE_RECORDS_SYMBOL) as SearchFinanceRecordsProvider
</script>

<template>
  <section class="section">
    <AppliedSearchFilters />
    <ModalTrigger class="modal-trigger" @click="searchProvider.setModalIsShowing(true)">
      {{ FINANCES_COPY.SEARCH_FINANCE_RECORDS_MODAL.EDIT_SEARCH_FILTERS }}
    </ModalTrigger>
  </section>

  <SearchFiltersModal />
</template>

<style scoped>
.section {
  padding: var(--space-md);
}

.modal-trigger {
  margin-block-start: var(--space-md);
}
</style>
