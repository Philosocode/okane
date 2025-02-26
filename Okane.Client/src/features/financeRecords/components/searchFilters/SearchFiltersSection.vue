<script setup lang="ts">
// Internal
import AppliedSearchFilters from '@features/financeRecords/components/searchFilters/AppliedSearchFilters.vue'
import ModalTrigger from '@shared/components/modal/ModalTrigger.vue'
import SearchFiltersModal from '@features/financeRecords/components/searchFilters/SearchFiltersModal.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import { useFinanceRecordSearchStore } from '@features/financeRecords/composables/useFinanceRecordSearchStore'

const searchStore = useFinanceRecordSearchStore()
</script>

<template>
  <section class="section">
    <AppliedSearchFilters />
    <ModalTrigger class="modal-trigger" with-shadow @click="searchStore.setModalIsShowing(true)">
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
