<script setup lang="ts">
// External
import { ref } from 'vue'

// Internal
import Modal from '@shared/components/modal/Modal.vue'
import ModalHeading from '@shared/components/modal/ModalHeading.vue'
import SearchFinanceRecordsForm from '@features/financeRecords/components/SearchFinanceRecordsForm.vue'

import { DEFAULT_FINANCE_RECORD_SEARCH_FILTERS } from '@features/financeRecords/constants/searchFinanceRecords'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import { type FinanceRecordsSearchFilters } from '@features/financeRecords/types/searchFinanceRecords'

import { useSearchFinanceRecordsStore } from '@features/financeRecords/composables/useSearchFinanceRecordsStore'

const formState = ref<FinanceRecordsSearchFilters>({ ...DEFAULT_FINANCE_RECORD_SEARCH_FILTERS })
const searchStore = useSearchFinanceRecordsStore()

function handleClose() {
  searchStore.setModalIsShowing(false)
}
</script>

<template>
  <Modal :is-showing="searchStore.modalIsShowing" @close="handleClose">
    <ModalHeading>{{
      FINANCES_COPY.SEARCH_FINANCE_RECORDS_MODAL.EDIT_SEARCH_FILTERS
    }}</ModalHeading>
    <SearchFinanceRecordsForm :form-state="formState" />
  </Modal>
</template>
