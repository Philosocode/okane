<script setup lang="ts">
// External
import { computed, ref, watchEffect } from 'vue'

// Internal
import SaveFinanceRecordModal from '@features/financeRecords/components/SaveFinanceRecordModal.vue'

import { financeRecordQueryKeys } from '@features/financeRecords/constants/queryKeys'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import type { SaveFinanceRecordFormState } from '@features/financeRecords/types/saveFinanceRecord'

import { useEditFinanceRecordMutation } from '@features/financeRecords/composables/useEditFinanceRecordMutation'
import { useSaveFinanceRecordStore } from '@features/financeRecords/composables/useSaveFinanceRecordStore'
import { useSearchFinanceRecordsStore } from '@features/financeRecords/composables/useSearchFinanceRecordsStore'

import { getFormErrorsFromAPIResponse } from '@shared/services/apiClient/utils'
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

const saveStore = useSaveFinanceRecordStore()

const searchStore = useSearchFinanceRecordsStore()
const queryKey = computed(() => financeRecordQueryKeys.listByFilters(searchStore.searchFilters))

const editMutation = useEditFinanceRecordMutation(queryKey)

const initialFormState = computed(() => {
  if (!saveStore.editingFinanceRecord) return getInitialSaveFinanceRecordFormState()
  return mapFinanceRecord.to.saveFinanceRecordFormState(saveStore.editingFinanceRecord)
})

const formState = ref<SaveFinanceRecordFormState>(getInitialSaveFinanceRecordFormState())
const initialFormErrors = getInitialFormErrors(formState.value)
const formErrors = ref({ ...initialFormErrors })

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
  saveStore.setEditingFinanceRecord(undefined)
}

function handleSubmit() {
  const id = saveStore.editingFinanceRecord?.id
  if (!id) return

  const { changes, hasChanges } = getSaveFinanceRecordFormChanges(
    initialFormState.value,
    formState.value,
  )
  if (!hasChanges) return

  formErrors.value = { ...initialFormErrors }

  editMutation.mutate(
    { id, changes: mapSaveFinanceRecordFormState.to.partialFinanceRecord(changes) },
    {
      onSuccess() {
        handleClose()
      },
      onError(err) {
        if (isObjectType(err)) {
          formErrors.value = getFormErrorsFromAPIResponse(err, formState.value)
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
    :is-showing="!!saveStore.editingFinanceRecord"
    :title="FINANCES_COPY.SAVE_FINANCE_RECORD_MODAL.EDIT_FINANCE_RECORD"
    @change="handleChange"
    @close="handleClose"
    @submit="handleSubmit"
  />
</template>
