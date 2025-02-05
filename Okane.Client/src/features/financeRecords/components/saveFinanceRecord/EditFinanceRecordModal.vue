<script setup lang="ts">
// External
import { computed, inject, ref, watchEffect } from 'vue'

// Internal
import SaveFinanceRecordModal from '@features/financeRecords/components/saveFinanceRecord/SaveFinanceRecordModal.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import { type SaveFinanceRecordFormState } from '@features/financeRecords/types/saveFinanceRecord'

import { useEditFinanceRecord } from '@features/financeRecords/composables/useEditFinanceRecord'
import { useToastStore } from '@shared/composables/useToastStore'

import {
  SAVE_FINANCE_RECORD_SYMBOL,
  type SaveFinanceRecordProvider,
} from '@features/financeRecords/providers/saveFinanceRecordProvider'

import { getFormErrorsFromApiResponse } from '@shared/services/apiClient/utils'
import { getInitialFormErrors } from '@shared/utils/form'
import { isObjectType } from '@shared/utils/object'
import {
  getInitialSaveFinanceRecordFormState,
  getSaveFinanceRecordFormChanges,
} from '@features/financeRecords/utils/saveFinanceRecord'
import {
  mapFinanceRecord,
  mapSaveFinanceRecordFormState,
} from '@features/financeRecords/utils/mappers'

const saveProvider = inject(SAVE_FINANCE_RECORD_SYMBOL) as SaveFinanceRecordProvider
const editMutation = useEditFinanceRecord()

const initialFormState = computed(() => {
  if (!saveProvider.financeRecordToEdit) return getInitialSaveFinanceRecordFormState()
  return mapFinanceRecord.to.saveFinanceRecordFormState(saveProvider.financeRecordToEdit)
})

const formState = ref<SaveFinanceRecordFormState>(getInitialSaveFinanceRecordFormState())
const initialFormErrors = getInitialFormErrors(formState.value)
const formErrors = ref({ ...initialFormErrors })

const { createToast } = useToastStore()

// When the editing finance record changes, reset the form state.
watchEffect(() => {
  formState.value = { ...initialFormState.value }
})

function handleChange(updates: Partial<SaveFinanceRecordFormState>) {
  formState.value = {
    ...formState.value,
    ...updates,
  }
}

function handleClose() {
  saveProvider.setFinanceRecordToEdit(undefined)
}

function handleSubmit() {
  const id = saveProvider.financeRecordToEdit?.id
  if (!id) return

  const { changes, hasChanges } = getSaveFinanceRecordFormChanges(
    initialFormState.value,
    formState.value,
  )
  if (!hasChanges) {
    handleClose()
    return
  }

  formErrors.value = { ...initialFormErrors }

  editMutation.mutate(
    { id, request: mapSaveFinanceRecordFormState.to.editFinanceRecordRequest(changes) },
    {
      onSuccess() {
        createToast(FINANCES_COPY.SAVE_FINANCE_RECORD_MODAL.TOASTS.EDIT_SUCCESS)
        handleClose()
      },
      onError(err) {
        if (isObjectType(err)) {
          formErrors.value = getFormErrorsFromApiResponse(err, formState.value)
        }
      },
    },
  )
}
</script>

<template>
  <SaveFinanceRecordModal
    :form-errors="formErrors"
    :form-state="formState"
    :is-showing="!!saveProvider.financeRecordToEdit"
    :title="FINANCES_COPY.SAVE_FINANCE_RECORD_MODAL.EDIT_FINANCE_RECORD"
    @change="handleChange"
    @close="handleClose"
    @submit="handleSubmit"
  />
</template>
