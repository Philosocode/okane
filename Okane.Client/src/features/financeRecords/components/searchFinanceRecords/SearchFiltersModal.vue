<script setup lang="ts">
// External
import { inject, ref } from 'vue'

// Internal
import Modal from '@shared/components/modal/Modal.vue'
import ModalHeading from '@shared/components/modal/ModalHeading.vue'
import SearchFinanceRecordsForm from '@features/financeRecords/components/searchFinanceRecords/SearchFiltersForm.vue'

import { DEFAULT_FINANCE_RECORDS_SEARCH_FILTERS } from '@features/financeRecords/constants/searchFinanceRecords'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import { type FinanceRecordsSearchFilters } from '@features/financeRecords/types/searchFinanceRecords'
import {
  SEARCH_FINANCE_RECORDS_SYMBOL,
  type SearchFinanceRecordsProvider,
} from '@features/financeRecords/providers/searchFinanceRecordsProvider'

const modalHeadingId = 'search-finance-records-modal-heading'
const formState = ref<FinanceRecordsSearchFilters>({ ...DEFAULT_FINANCE_RECORDS_SEARCH_FILTERS })
const searchProvider = inject(SEARCH_FINANCE_RECORDS_SYMBOL) as SearchFinanceRecordsProvider

function handleClose() {
  searchProvider.setModalIsShowing(false)
}
</script>

<template>
  <Modal
    :is-showing="searchProvider.modalIsShowing"
    :modal-heading-id="modalHeadingId"
    @close="handleClose"
  >
    <ModalHeading :id="modalHeadingId">{{
      FINANCES_COPY.SEARCH_FINANCE_RECORDS_MODAL.EDIT_SEARCH_FILTERS
    }}</ModalHeading>
    <SearchFinanceRecordsForm :form-state="formState" />
  </Modal>
</template>
