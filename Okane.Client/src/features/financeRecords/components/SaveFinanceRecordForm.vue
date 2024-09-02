<script setup lang="ts">
// External
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, inject, ref } from 'vue'

// Internal
import Modal from '@shared/components/modal/Modal.vue'
import ModalActions from '@shared/components/modal/ModalActions.vue'
import ModalHeading from '@shared/components/modal/ModalHeading.vue'
import SaveFinanceRecordFormInputs from '@features/financeRecords/components/SaveFinanceRecordFormInputs.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { FINANCE_RECORD_QUERY_KEYS } from '@features/financeRecords/constants/queryKeys'
import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'
import { SHARED_COPY } from '@shared/constants/copy'
import {
  DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
  FINANCE_RECORD_SEARCH_FILTERS_KEY,
} from '@features/financeRecords/constants/searchFilters'

import { type SaveFinanceRecordFormState } from '@features/financeRecords/types/saveFinanceRecord'

import { useCreateFinanceRecordMutation } from '@features/financeRecords/composables/useCreateFinanceRecordMutation'
import { useModal } from '@shared/composables/useModal'

import { dateToDateTimeLocalFormat } from '@shared/utils/dateTime'
import { getFormErrorsFromAPIResponse } from '@shared/services/apiClient/utils'
import { getInitialFormErrors } from '@shared/utils/form'
import { isObjectType } from '@shared/utils/object'
import { mapSaveFinanceRecordFormStateToFinanceRecord } from '@features/financeRecords/utils/mappers'

const { showModal, closeModal, modalIsShowing } = useModal()

const searchFilters = inject(FINANCE_RECORD_SEARCH_FILTERS_KEY)

const queryKey = computed(() =>
  FINANCE_RECORD_QUERY_KEYS.LIST_BY_FILTERS(
    searchFilters?.value ?? DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
  ),
)
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
  <button class="create-button" @click="showModal">
    <FontAwesomeIcon
      icon="fa-solid fa-plus"
      :title="FINANCES_COPY.SAVE_FINANCE_RECORD_MODAL.SHOW_MODAL"
    />
  </button>
  <Modal :is-showing="modalIsShowing" @close="closeModal">
    <ModalHeading>{{ FINANCES_COPY.SAVE_FINANCE_RECORD_MODAL.CREATE_FINANCE_RECORD }}</ModalHeading>

    <form ref="formRef" @submit.prevent class="form">
      <SaveFinanceRecordFormInputs
        :form-state="formState"
        :form-errors="formErrors"
        @input-updated="handleInputUpdated"
      />

      <ModalActions>
        <button @click="handleSave" type="submit">{{ SHARED_COPY.ACTIONS.SAVE }}</button>
        <button @click="closeModal" type="button">{{ SHARED_COPY.ACTIONS.CANCEL }}</button>
      </ModalActions>
    </form>
  </Modal>
</template>

<style scoped>
.create-button {
  --button-size: clamp(2rem, 2rem + 2.5vw, 3rem);
  --offset: clamp(0.5rem, 0.5rem + 0.5vw, 1rem);

  border: none;
  border-radius: 50%;
  font-size: 1.25rem;
  position: fixed;
  bottom: var(--offset);
  right: var(--offset);
  height: var(--button-size);
  width: var(--button-size);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
