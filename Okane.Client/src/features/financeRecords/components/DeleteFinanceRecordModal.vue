<script setup lang="ts">
// External
import { computed } from 'vue'

// Internal
import Modal from '@shared/components/modal/Modal.vue'
import ModalActions from '@shared/components/modal/ModalActions.vue'
import ModalHeading from '@shared/components/modal/ModalHeading.vue'

import { financeRecordQueryKeys } from '@features/financeRecords/constants/queryKeys'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { SHARED_COPY } from '@shared/constants/copy'

import { useDeleteFinanceRecordStore } from '@features/financeRecords/composables/useDeleteFinanceRecordStore'
import { useDeleteFinanceRecordMutation } from '@features/financeRecords/composables/useDeleteFinanceRecordMutation'
import { useQueryFinanceRecordStore } from '@features/financeRecords/composables/useQueryFinanceRecordStore'

const deleteStore = useDeleteFinanceRecordStore()
const queryStore = useQueryFinanceRecordStore()

const queryKey = computed(() => financeRecordQueryKeys.listByFilters(queryStore.searchFilters))
const deleteMutation = useDeleteFinanceRecordMutation(queryKey)

function handleClose() {
  deleteStore.clearDeletingFinanceRecordId()
}

function handleDelete() {
  const id = deleteStore.financeRecordId
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
  <Modal :is-showing="!!deleteStore.financeRecordId" @close="handleClose">
    <ModalHeading>{{
      FINANCES_COPY.DELETE_FINANCE_RECORD_MODAL.DELETE_FINANCE_RECORD
    }}</ModalHeading>

    <p class="confirmation">{{ FINANCES_COPY.DELETE_FINANCE_RECORD_MODAL.ARE_YOU_SURE }}</p>

    <ModalActions>
      <button @click="handleDelete">{{ SHARED_COPY.ACTIONS.DELETE }}</button>
      <button @click="handleClose">{{ SHARED_COPY.ACTIONS.CANCEL }}</button>
    </ModalActions>
  </Modal>
</template>
