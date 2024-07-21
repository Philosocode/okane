<script setup lang="ts">
// External
import { ref } from 'vue'

// Internal
import Modal from '@shared/components/modal/Modal.vue'
import ModalActions from '@shared/components/modal/ModalActions.vue'
import ModalHeading from '@shared/components/modal/ModalHeading.vue'
import SaveFinanceRecordFormInputs from '@features/financeRecords/components/SaveFinanceRecordFormInputs.vue'

import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/financeRecord.constants'

import type { SaveFinanceRecordFormState } from '@features/financeRecords/types/financeRecord.types'

import { useModal } from '@shared/composables/useModal'

import { dateToDateTimeLocalFormat } from '@shared/utils/dateTime.utils'
import { getFormErrorsFromAPIResponse } from '@shared/services/apiClient/apiClient.utils'
import { getInitialFormErrors } from '@shared/utils/form.utils'
import { isObjectType } from '@shared/utils/object.utils'
import { mapSaveFinanceRecordFormStateToFinanceRecord } from '@features/financeRecords/utils/financeRecord.utils'
import { useSaveFinanceRecord } from '@features/financeRecords/composables/useSaveFinanceRecord.composable'

const { showModal, closeModal, modalIsShowing } = useModal()

const { saveFinanceRecord } = useSaveFinanceRecord()

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

async function handleSave() {
  if (!formRef.value?.checkValidity()) return

  formErrors.value = { ...initialFormErrors }

  try {
    const financeRecord = mapSaveFinanceRecordFormStateToFinanceRecord(formState.value)

    await saveFinanceRecord(financeRecord)
    resetForm()
  } catch (err: any) {
    if (isObjectType(err)) {
      formErrors.value = getFormErrorsFromAPIResponse(err, initialFormState)
    }

    // TODO #41: Display toast for other errors.
  }
}
</script>

<template>
  <button @click="showModal">Show Modal</button>
  <Modal :is-showing="modalIsShowing" @close="closeModal">
    <ModalHeading>Create Finance Record</ModalHeading>

    <form ref="formRef" @submit.prevent class="form">
      <SaveFinanceRecordFormInputs :form-state="formState" :form-errors="formErrors" />

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
