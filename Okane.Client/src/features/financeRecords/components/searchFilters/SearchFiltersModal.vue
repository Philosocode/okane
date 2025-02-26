<script setup lang="ts">
// External
import { ref } from 'vue'

// Internal
import Modal from '@shared/components/modal/Modal.vue'
import SearchFiltersForm from '@features/financeRecords/components/searchFilters/SearchFiltersForm.vue'

import { DEFAULT_FINANCE_RECORD_SEARCH_FILTERS } from '@features/financeRecords/constants/searchFilters'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import { type FinanceRecordSearchFilters } from '@features/financeRecords/types/searchFilters'

import { useFinanceRecordSearchStore } from '@features/financeRecords/composables/useFinanceRecordSearchStore'

const modalHeadingId = 'search-finance-records-modal-heading'
const formState = ref<FinanceRecordSearchFilters>({ ...DEFAULT_FINANCE_RECORD_SEARCH_FILTERS })
const searchStore = useFinanceRecordSearchStore()

function handleClose() {
  searchStore.setModalIsShowing(false)
}
</script>

<template>
  <Modal
    :heading-text="FINANCES_COPY.SEARCH_FINANCE_RECORDS_MODAL.EDIT_SEARCH_FILTERS"
    :is-showing="searchStore.modalIsShowing"
    :modal-heading-id="modalHeadingId"
    @close="handleClose"
  >
    <SearchFiltersForm :form-state="formState" />
  </Modal>
</template>
