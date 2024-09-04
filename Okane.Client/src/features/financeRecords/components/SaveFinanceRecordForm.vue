<script setup lang="ts">
// External
import { computed, ref } from 'vue'

// Internal
import Modal from '@shared/components/modal/Modal.vue'
import ModalActions from '@shared/components/modal/ModalActions.vue'
import ModalHeading from '@shared/components/modal/ModalHeading.vue'
import SaveFinanceRecordFormInputs from '@features/financeRecords/components/SaveFinanceRecordFormInputs.vue'

import { financeRecordQueryKeys } from '@features/financeRecords/constants/queryKeys'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'
import { SHARED_COPY } from '@shared/constants/copy'

import { type SaveFinanceRecordFormState } from '@features/financeRecords/types/saveFinanceRecord'
import { type FinanceRecordSearchFilters } from '@features/financeRecords/types/searchFilters'

import { useCreateFinanceRecordMutation } from '@features/financeRecords/composables/useCreateFinanceRecordMutation'

import { dateToDateTimeLocalFormat } from '@shared/utils/dateTime'
import { getFormErrorsFromAPIResponse } from '@shared/services/apiClient/utils'
import { getInitialFormErrors } from '@shared/utils/form'
import { isObjectType } from '@shared/utils/object'
import { mapSaveFinanceRecordFormStateToFinanceRecord } from '@features/financeRecords/utils/mappers'

type Props = {
  isShowing: boolean
  searchFilters: FinanceRecordSearchFilters
}

const props = defineProps<Props>()

defineEmits(['close'])

const queryKey = computed(() => financeRecordQueryKeys.listByFilters(props.searchFilters))
const { mutate: createFinanceRecord } = useCreateFinanceRecordMutation(queryKey)

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
  <Modal :is-showing="props.isShowing" @close="$emit('close')">
    <ModalHeading>{{ FINANCES_COPY.SAVE_FINANCE_RECORD_MODAL.CREATE_FINANCE_RECORD }}</ModalHeading>

    <form ref="formRef" @submit.prevent class="form">
      <SaveFinanceRecordFormInputs
        :form-state="formState"
        :form-errors="formErrors"
        @input-updated="handleInputUpdated"
      />

      <ModalActions>
        <button @click="handleSave" type="submit">{{ SHARED_COPY.ACTIONS.SAVE }}</button>
        <button @click="$emit('close')" type="button">{{ SHARED_COPY.ACTIONS.CANCEL }}</button>
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
