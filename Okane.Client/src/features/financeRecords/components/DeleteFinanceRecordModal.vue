<script setup lang="ts">
// External
import { inject } from 'vue'

// Internal
import DeleteFinanceRecordModalActions from '@features/financeRecords/components/DeleteFinanceRecordModalActions.vue'
import Modal from '@shared/components/modal/Modal.vue'
import ModalHeading from '@shared/components/modal/ModalHeading.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import { useDeleteFinanceRecord } from '@features/financeRecords/composables/useDeleteFinanceRecord'

import {
  DELETE_FINANCE_RECORD_ID_SYMBOL,
  type DeleteFinanceRecordIdProvider,
} from '@features/financeRecords/providers/deleteFinanceRecordIdProvider'

const deleteProvider = inject(DELETE_FINANCE_RECORD_ID_SYMBOL) as DeleteFinanceRecordIdProvider

const modalHeadingId = 'delete-finance-record-modal-heading'
const deleteMutation = useDeleteFinanceRecord()

function handleClose() {
  deleteProvider.setId(undefined)
}

function handleDelete() {
  const id = deleteProvider.id
  if (id) {
    deleteMutation.mutate(id, {
      onSuccess() {
        handleClose()
      },
    })
  }
}
</script>

<template>
  <Modal :is-showing="!!deleteProvider.id" :modal-heading-id="modalHeadingId" @close="handleClose">
    <ModalHeading :id="modalHeadingId">{{
      FINANCES_COPY.DELETE_FINANCE_RECORD_MODAL.DELETE_FINANCE_RECORD
    }}</ModalHeading>

    <p class="confirmation">{{ FINANCES_COPY.DELETE_FINANCE_RECORD_MODAL.ARE_YOU_SURE }}</p>

    <DeleteFinanceRecordModalActions :handle-close="handleClose" :handle-delete="handleDelete" />
  </Modal>
</template>
