<script setup lang="ts">
// External
import { inject, ref } from 'vue'

// Internal
import Modal from '@shared/components/modal/Modal.vue'
import SearchFiltersForm from '@features/financeRecords/components/searchFilters/SearchFiltersForm.vue'

import { DEFAULT_FINANCE_RECORD_SEARCH_FILTERS } from '@features/financeRecords/constants/searchFilters'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import { type FinanceRecordSearchFilters } from '@features/financeRecords/types/searchFilters'
import {
  FINANCE_RECORD_SEARCH_FILTERS_SYMBOL,
  type FinanceRecordSearchFiltersProvider,
} from '@features/financeRecords/providers/financeRecordSearchFiltersProvider'

const modalHeadingId = 'search-finance-records-modal-heading'
const formState = ref<FinanceRecordSearchFilters>({ ...DEFAULT_FINANCE_RECORD_SEARCH_FILTERS })
const searchProvider = inject(
  FINANCE_RECORD_SEARCH_FILTERS_SYMBOL,
) as FinanceRecordSearchFiltersProvider

function handleClose() {
  searchProvider.setModalIsShowing(false)
}
</script>

<template>
  <Modal
    :heading-text="FINANCES_COPY.SEARCH_FINANCE_RECORDS_MODAL.EDIT_SEARCH_FILTERS"
    :is-showing="searchProvider.modalIsShowing"
    :modal-heading-id="modalHeadingId"
    @close="handleClose"
  >
    <SearchFiltersForm :form-state="formState" />
  </Modal>
</template>
