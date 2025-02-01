<script setup lang="ts">
// External
import { inject } from 'vue'

// Internal
import DeleteFinanceRecordModalActions from '@features/financeRecords/components/DeleteFinanceRecordModalActions.vue'
import FinanceRecordSummary from '@features/financeRecords/components/FinanceRecordSummary.vue'
import Modal from '@shared/components/modal/Modal.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import { useDeleteFinanceRecord } from '@features/financeRecords/composables/useDeleteFinanceRecord'

import {
  DELETE_FINANCE_RECORD_SYMBOL,
  type DeleteFinanceRecordProvider,
} from '@features/financeRecords/providers/deleteFinanceRecordProvider'

const deleteProvider = inject(DELETE_FINANCE_RECORD_SYMBOL) as DeleteFinanceRecordProvider

const modalHeadingId = 'delete-finance-record-modal-heading'
const deleteMutation = useDeleteFinanceRecord()

function handleClose() {
  deleteProvider.setFinanceRecordToDelete(undefined)
}

function handleDelete() {
  const financeRecord = deleteProvider.financeRecordToDelete
  if (financeRecord) {
    deleteMutation.mutate(financeRecord, {
      onSuccess() {
        handleClose()
      },
    })
  }
}
</script>

<template>
  <Modal
    :is-showing="!!deleteProvider.financeRecordToDelete"
    :heading-text="FINANCES_COPY.DELETE_FINANCE_RECORD_MODAL.DELETE_FINANCE_RECORD"
    :modal-heading-id="modalHeadingId"
    @close="handleClose"
  >
    <p class="confirmation">{{ FINANCES_COPY.DELETE_FINANCE_RECORD_MODAL.CONFIRMATION_TEXT }}</p>
    <FinanceRecordSummary :finance-record="deleteProvider.financeRecordToDelete!" />
    <DeleteFinanceRecordModalActions :handle-close="handleClose" :handle-delete="handleDelete" />
  </Modal>
</template>
