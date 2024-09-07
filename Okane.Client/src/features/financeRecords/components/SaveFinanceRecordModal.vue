<script setup lang="ts">
// External
import { useTemplateRef } from 'vue'

// Internal
import Modal from '@shared/components/modal/Modal.vue'
import ModalActions from '@shared/components/modal/ModalActions.vue'
import ModalHeading from '@shared/components/modal/ModalHeading.vue'
import SaveFinanceRecordFormInputs from '@features/financeRecords/components/SaveFinanceRecordFormInputs.vue'

import { SHARED_COPY } from '@shared/constants/copy'

import { type FormErrors } from '@shared/types/form'
import { type SaveFinanceRecordFormState } from '@features/financeRecords/types/saveFinanceRecord'

type Props = {
  formState: SaveFinanceRecordFormState
  formErrors: FormErrors<SaveFinanceRecordFormState>
  isShowing: boolean
  title: string
}

const { formState, isShowing, title } = defineProps<Props>()

const emit = defineEmits<{
  (event: 'change', updates: Partial<SaveFinanceRecordFormState>): void
  (event: 'close'): void
  (event: 'submit'): void
}>()

const formRef = useTemplateRef<HTMLFormElement>('form')

function handleChange(updates: Partial<SaveFinanceRecordFormState>): void {
  emit('change', updates)
}

function handleClose() {
  emit('close')
}

function handleSave() {
  if (!formRef.value?.checkValidity()) return

  emit('submit')
}
</script>

<template>
  <Modal :is-showing="isShowing" @close="handleClose">
    <ModalHeading>{{ title }}</ModalHeading>

    <form ref="form" @submit.prevent class="form">
      <SaveFinanceRecordFormInputs
        :form-state="formState"
        :form-errors="formErrors"
        @change="handleChange"
      />

      <ModalActions>
        <button @click="handleSave" type="submit">{{ SHARED_COPY.ACTIONS.SAVE }}</button>
        <button @click="handleClose" type="button">{{ SHARED_COPY.ACTIONS.CANCEL }}</button>
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
