<script setup lang="ts">
// External
import { ref, watch } from 'vue'

// Internal
import ModalActions from '@shared/components/modal/ModalActions.vue'
import SaveFinanceRecordFormInputs from '@features/financeRecords/components/SaveFinanceRecordFormInputs.vue'

import { SHARED_COPY } from '@shared/constants/copy'

import { type SaveFinanceRecordFormState } from '@features/financeRecords/types/saveFinanceRecord'

import { getInitialFormErrors } from '@shared/utils/form'

type Props = {
  initialState: SaveFinanceRecordFormState
}

const { initialState } = defineProps<Props>()

const emit = defineEmits<{
  (event: 'close', formState: SaveFinanceRecordFormState): void
  (event: 'submit', formState: SaveFinanceRecordFormState): void
}>()

const initialFormErrors = getInitialFormErrors(initialState)

const formState = ref({ ...initialState })
const formErrors = ref({ ...initialFormErrors })

// Whenever the initial form changes, override the current form state.
watch(
  () => initialState,
  () => {
    formState.value = { ...initialState }
    formErrors.value = { ...initialFormErrors }
  },
)

const formRef = ref<HTMLFormElement | null>(null)

function handleInputUpdated(data: Partial<SaveFinanceRecordFormState>) {
  formState.value = {
    ...formState.value,
    ...data,
  }
}

function handleSave() {
  if (!formRef.value?.checkValidity()) return

  formErrors.value = { ...initialFormErrors }
  emit('submit', formState.value)
}
</script>

<template>
  <form ref="formRef" @submit.prevent class="form">
    <SaveFinanceRecordFormInputs
      :form-state="formState"
      :form-errors="formErrors"
      @input-updated="handleInputUpdated"
    />

    <ModalActions>
      <button @click="handleSave" type="submit">{{ SHARED_COPY.ACTIONS.SAVE }}</button>
      <button @click="emit('close', formState)" type="button">
        {{ SHARED_COPY.ACTIONS.CANCEL }}
      </button>
    </ModalActions>
  </form>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
