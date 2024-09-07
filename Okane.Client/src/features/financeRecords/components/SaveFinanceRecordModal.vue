<script setup lang="ts">
// External
import { computed } from 'vue'

// Internal
import Modal from '@shared/components/modal/Modal.vue'
import ModalHeading from '@shared/components/modal/ModalHeading.vue'
import SaveFinanceRecordModalContent from '@features/financeRecords/components/SaveFinanceRecordModalContent.vue'

import { financeRecordQueryKeys } from '@features/financeRecords/constants/queryKeys'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import { type FinanceRecord } from '@features/financeRecords/types/financeRecord'
import { type FinanceRecordSearchFilters } from '@features/financeRecords/types/searchFilters'
import { type SaveFinanceRecordFormState } from '@features/financeRecords/types/saveFinanceRecord'

import { useCreateFinanceRecordMutation } from '@features/financeRecords/composables/useCreateFinanceRecordMutation'
import { useEditFinanceRecord } from '@features/financeRecords/composables/useEditFinanceRecord'

import { getSaveFinanceRecordFormChanges } from '@features/financeRecords/utils/saveFinanceRecord'
import { mapSaveFinanceRecordFormState } from '@features/financeRecords/utils/mappers'

type Props = {
  editingFinanceRecord?: FinanceRecord
  clearEditingFinanceRecord: () => void
  isShowing: boolean
  searchFilters: FinanceRecordSearchFilters
}

const { clearEditingFinanceRecord, editingFinanceRecord, isShowing, searchFilters } =
  defineProps<Props>()

const emit = defineEmits(['close'])

const isEditing = computed(() => !!editingFinanceRecord)

const queryKey = computed(() => financeRecordQueryKeys.listByFilters(searchFilters))

const { createFormState, createFinanceRecord } = useCreateFinanceRecordMutation(queryKey)
const { editFormState, editMutation } = useEditFinanceRecord(() => editingFinanceRecord, queryKey)

const initialFormState = computed(() => {
  return isEditing.value ? editFormState.value : createFormState.value
})

function handleClose(formState: SaveFinanceRecordFormState) {
  if (isEditing.value) {
    clearEditingFinanceRecord()
  } else {
    createFormState.value = {
      ...createFormState.value,
      ...formState,
    }
  }

  emit('close')
}

function handleSubmit(formState: SaveFinanceRecordFormState) {
  if (isEditing.value) {
    handleEdit(formState)
  } else {
    createFinanceRecord(formState)
  }
}

function handleEdit(formState: SaveFinanceRecordFormState) {
  const { changes, hasChanges } = getSaveFinanceRecordFormChanges(initialFormState.value, formState)
  const updatedRecord = mapSaveFinanceRecordFormState.to.partialFinanceRecord(changes)

  if (hasChanges) {
    editMutation.mutate(updatedRecord, {
      onSuccess() {
        emit('close')
      },
      onError(error) {
        console.error('Error editing finance record:', error)
      },
    })
  } else {
    emit('close')
  }
}
</script>

<template>
  <Modal :is-showing="isShowing" @close="emit('close')">
    <ModalHeading>{{ FINANCES_COPY.SAVE_FINANCE_RECORD_MODAL.CREATE_FINANCE_RECORD }}</ModalHeading>
    <SaveFinanceRecordModalContent
      :initial-state="initialFormState"
      @close="handleClose"
      @submit="handleSubmit"
    />
  </Modal>
</template>
