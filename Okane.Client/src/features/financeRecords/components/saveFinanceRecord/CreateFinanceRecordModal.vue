<script setup lang="ts">
// External
import { inject, ref } from 'vue'

// Internal
import SaveFinanceRecordModal from '@features/financeRecords/components/saveFinanceRecord/SaveFinanceRecordModal.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import { type SaveFinanceRecordFormState } from '@features/financeRecords/types/saveFinanceRecord'

import { useCreateFinanceRecord } from '@features/financeRecords/composables/useCreateFinanceRecord'
import { useToastStore } from '@shared/composables/useToastStore'

import {
  SAVE_FINANCE_RECORD_SYMBOL,
  type SaveFinanceRecordProvider,
} from '@features/financeRecords/providers/saveFinanceRecordProvider'

import { getFormErrorsFromApiResponse } from '@shared/services/apiClient/utils'
import { getInitialFormErrors } from '@shared/utils/form'
import { getInitialSaveFinanceRecordFormState } from '@features/financeRecords/utils/saveFinanceRecord'
import { isObjectType } from '@shared/utils/object'
import { mapSaveFinanceRecordFormState } from '@features/financeRecords/utils/mappers'

const createMutation = useCreateFinanceRecord()
const saveProvider = inject(SAVE_FINANCE_RECORD_SYMBOL) as SaveFinanceRecordProvider

const formState = ref<SaveFinanceRecordFormState>(getInitialSaveFinanceRecordFormState())
const initialFormErrors = getInitialFormErrors(formState.value)
const formErrors = ref({ ...initialFormErrors })

const { createToast } = useToastStore()

function handleChange(updates: Partial<SaveFinanceRecordFormState>) {
  formState.value = {
    ...formState.value,
    ...updates,
  }
}

function handleClose() {
  saveProvider.setIsCreating(false)
}

function handleSubmit() {
  const request = mapSaveFinanceRecordFormState.to.createFinanceRecordRequest(formState.value)

  formErrors.value = { ...initialFormErrors }

  createMutation.mutate(request, {
    onSuccess() {
      formState.value = {
        ...formState.value,
        amount: '0',
        description: '',
        tags: [],
      }

      createToast(FINANCES_COPY.SAVE_FINANCE_RECORD_MODAL.TOASTS.CREATE_SUCCESS)
    },
    onError(err) {
      if (isObjectType(err)) {
        formErrors.value = getFormErrorsFromApiResponse(err, formState.value)
      }
    },
  })
}
</script>

<template>
  <SaveFinanceRecordModal
    :form-errors="formErrors"
    :form-state="formState"
    :is-showing="saveProvider.isCreating"
    :title="FINANCES_COPY.SAVE_FINANCE_RECORD_MODAL.CREATE_FINANCE_RECORD"
    @change="handleChange"
    @close="handleClose"
    @submit="handleSubmit"
  />
</template>
