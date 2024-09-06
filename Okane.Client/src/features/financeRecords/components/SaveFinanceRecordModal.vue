<script setup lang="ts">
// External
import { computed } from 'vue'

// Internal
import Modal from '@shared/components/modal/Modal.vue'
import ModalHeading from '@shared/components/modal/ModalHeading.vue'
import SaveFinanceRecordModalContent from '@features/financeRecords/components/SaveFinanceRecordModalContent.vue'

import { financeRecordQueryKeys } from '@features/financeRecords/constants/queryKeys'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import { type FinanceRecordSearchFilters } from '@features/financeRecords/types/searchFilters'
import { type SaveFinanceRecordFormState } from '@features/financeRecords/types/saveFinanceRecord'

import { useCreateFinanceRecordMutation } from '@features/financeRecords/composables/useCreateFinanceRecordMutation'

type Props = {
  isShowing: boolean
  searchFilters: FinanceRecordSearchFilters
}

const { isShowing, searchFilters } = defineProps<Props>()
const emit = defineEmits(['close'])

const queryKey = computed(() => financeRecordQueryKeys.listByFilters(searchFilters))

const { createFormState, createFinanceRecord } = useCreateFinanceRecordMutation(queryKey)

function handleClose(formState: SaveFinanceRecordFormState) {
  createFormState.value = {
    ...createFormState.value,
    ...formState,
  }

  emit('close')
}
</script>

<template>
  <Modal :is-showing="isShowing" @close="emit('close')">
    <ModalHeading>{{ FINANCES_COPY.SAVE_FINANCE_RECORD_MODAL.CREATE_FINANCE_RECORD }}</ModalHeading>
    <SaveFinanceRecordModalContent
      :initial-state="createFormState"
      @close="handleClose"
      @submit="createFinanceRecord"
    />
  </Modal>
</template>
