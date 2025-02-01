<script setup lang="ts">
// External
import { useTemplateRef } from 'vue'

// Internal
import Button from '@shared/components/Button.vue'
import Modal from '@shared/components/modal/Modal.vue'
import ModalActions from '@shared/components/modal/ModalActions.vue'
import SaveFinanceRecordFormInputs from '@features/financeRecords/components/SaveFinanceRecordFormInputs.vue'

import { SHARED_COPY } from '@shared/constants/copy'

import { type FormErrors } from '@shared/types/form'
import { type SaveFinanceRecordFormState } from '@features/financeRecords/types/saveFinanceRecord'

export type SaveFinanceRecordModalProps = {
  formState: SaveFinanceRecordFormState
  formErrors: FormErrors<SaveFinanceRecordFormState>
  isShowing: boolean
  title: string
}

const { formErrors, formState, isShowing, title } = defineProps<SaveFinanceRecordModalProps>()

const emit = defineEmits<{
  (event: 'change', updates: Partial<SaveFinanceRecordFormState>): void
  (event: 'close'): void
  (event: 'submit'): void
}>()

const modalHeadingId = 'save-finance-record-modal-heading'
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
  <Modal
    :is-showing="isShowing"
    :heading-text="title"
    :modal-heading-id="modalHeadingId"
    @close="handleClose"
  >
    <form ref="form" @submit.prevent class="form">
      <SaveFinanceRecordFormInputs
        :form-state="formState"
        :form-errors="formErrors"
        @change="handleChange"
      />

      <ModalActions>
        <Button @click="handleSave" type="submit" variant="callToAction">{{
          SHARED_COPY.ACTIONS.SAVE
        }}</Button>
        <Button @click="handleClose" type="button">{{ SHARED_COPY.ACTIONS.CANCEL }}</Button>
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
