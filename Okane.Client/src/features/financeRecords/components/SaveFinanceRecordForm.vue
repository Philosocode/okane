<script setup lang="ts">
// External
import { inject, ref } from 'vue'

// Internal
import Modal from '@shared/components/modal/Modal.vue'
import ModalActions from '@shared/components/modal/ModalActions.vue'
import ModalHeading from '@shared/components/modal/ModalHeading.vue'
import SaveFinanceRecordFormInputs from '@features/financeRecords/components/SaveFinanceRecordFormInputs.vue'

import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'

import { useCreateFinanceRecordMutation } from '@features/financeRecords/composables/useCreateFinanceRecordMutation'
import { useModal } from '@shared/composables/useModal'

import { dateToDateTimeLocalFormat } from '@shared/utils/dateTime'
import { getFormErrorsFromAPIResponse } from '@shared/services/apiClient/utils'
import { getInitialFormErrors } from '@shared/utils/form'
import { isObjectType } from '@shared/utils/object'
import { mapSaveFinanceRecordFormStateToFinanceRecord } from '@features/financeRecords/utils/mappers'
import type { SaveFinanceRecordFormState } from '@features/financeRecords/types/saveFinanceRecord'
import { FINANCE_RECORD_SEARCH_FILTERS_KEY } from '@features/financeRecords/constants/searchFilters'

const { showModal, closeModal, modalIsShowing } = useModal()

const searchFilters = inject(FINANCE_RECORD_SEARCH_FILTERS_KEY)
const { mutate: createFinanceRecord } = useCreateFinanceRecordMutation(searchFilters)

const initialFormState: SaveFinanceRecordFormState = {
  amount: 0,
  description: '',
  happenedAt: dateToDateTimeLocalFormat(new Date(Date.now())),
  type: FINANCE_RECORD_TYPE.EXPENSE,
}

const initialFormErrors = getInitialFormErrors(initialFormState)

const formState = ref({ ...initialFormState })
const formErrors = ref({ ...initialFormErrors })

const formRef = ref<HTMLFormElement | null>(null)

function resetForm() {
  formState.value.amount = initialFormState.amount
  formState.value.description = initialFormState.description

  formErrors.value = { ...initialFormErrors }
}

function handleInputUpdated(data: Partial<SaveFinanceRecordFormState>) {
  formState.value = {
    ...formState.value,
    ...data,
  }
}

function handleSave() {
  if (!formRef.value?.checkValidity()) return

  formErrors.value = { ...initialFormErrors }

  const financeRecord = mapSaveFinanceRecordFormStateToFinanceRecord(formState.value)

  createFinanceRecord(financeRecord, {
    onSuccess() {
      resetForm()
    },
    onError(err) {
      if (isObjectType(err)) {
        formErrors.value = getFormErrorsFromAPIResponse(err, initialFormState)
      }

      // TODO #41: Display toast for other errors.
    },
  })
}
</script>

<template>
  <button @click="showModal">Show Modal</button>
  <Modal :is-showing="modalIsShowing" @close="closeModal">
    <ModalHeading>Create Finance Record</ModalHeading>

    <form ref="formRef" @submit.prevent class="form">
      <SaveFinanceRecordFormInputs
        :form-state="formState"
        :form-errors="formErrors"
        @input-updated="handleInputUpdated"
      />

      <ModalActions>
        <button @click="handleSave" type="submit">Save</button>
        <button @click="closeModal" type="button">Cancel</button>
      </ModalActions>
    </form>
  </Modal>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
