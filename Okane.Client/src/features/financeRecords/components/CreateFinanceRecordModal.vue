<script setup lang="ts">
// External
import { computed, ref } from 'vue'

// Internal
import SaveFinanceRecordModal from '@features/financeRecords/components/SaveFinanceRecordModal.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { financeRecordQueryKeys } from '@features/financeRecords/constants/queryKeys'

import type { SaveFinanceRecordFormState } from '@features/financeRecords/types/saveFinanceRecord'

import { useCreateFinanceRecordMutation } from '@features/financeRecords/composables/useCreateFinanceRecordMutation'
import { useSearchFinanceRecordsStore } from '@features/financeRecords/composables/useSearchFinanceRecordsStore'
import { useSaveFinanceRecordStore } from '@features/financeRecords/composables/useSaveFinanceRecordStore'

import { getFormErrorsFromAPIResponse } from '@shared/services/apiClient/utils'
import { getInitialFormErrors } from '@shared/utils/form'
import { getInitialSaveFinanceRecordFormState } from '@features/financeRecords/utils/saveFinanceRecord'
import { isObjectType } from '@shared/utils/object'
import { mapSaveFinanceRecordFormState } from '@features/financeRecords/utils/mappers'

const saveStore = useSaveFinanceRecordStore()

const searchStore = useSearchFinanceRecordsStore()
const queryKey = computed(() => financeRecordQueryKeys.listByFilters(searchStore.searchFilters))

const createMutation = useCreateFinanceRecordMutation(queryKey)

const formState = ref<SaveFinanceRecordFormState>(getInitialSaveFinanceRecordFormState())
const initialFormErrors = getInitialFormErrors(formState.value)
const formErrors = ref({ ...initialFormErrors })

function handleChange(updates: Partial<SaveFinanceRecordFormState>) {
  formState.value = {
    ...formState.value,
    ...updates,
  }
}

function handleClose() {
  saveStore.setIsCreating(false)
}

function handleSubmit() {
  const financeRecord = mapSaveFinanceRecordFormState.to.preCreationFinanceRecord(formState.value)

  formErrors.value = { ...initialFormErrors }

  createMutation.mutate(financeRecord, {
    onSuccess() {
      formState.value = {
        ...formState.value,
        amount: 0,
        description: '',
      }
    },
    onError(err) {
      if (isObjectType(err)) {
        formErrors.value = getFormErrorsFromAPIResponse(err, formState.value)
      }
    },
  })
}
</script>

<template>
  <SaveFinanceRecordModal
    :form-errors="formErrors"
    :form-state="formState"
    :is-showing="saveStore.isCreating"
    :title="FINANCES_COPY.SAVE_FINANCE_RECORD_MODAL.CREATE_FINANCE_RECORD"
    @change="handleChange"
    @close="handleClose"
    @submit="handleSubmit"
  />
</template>
