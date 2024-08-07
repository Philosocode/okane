<script setup lang="ts">
// Internal
import FormInput from '@shared/components/form/FormInput.vue'
import FormSelect from '@shared/components/form/FormSelect.vue'

import { INPUT_TYPE } from '@shared/constants/form.constants'
import {
  FINANCE_RECORD_MAX_AMOUNT,
  FINANCE_RECORD_MIN_AMOUNT,
  FINANCE_RECORD_TYPE_OPTIONS,
} from '@features/financeRecords/constants/financeRecord.constants'

import type {
  SaveFinanceRecordFormState,
  SaveFinanceRecordFormErrors,
} from '@features/financeRecords/types/financeRecord.types'

type Props = {
  formState: SaveFinanceRecordFormState
  formErrors: SaveFinanceRecordFormErrors
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'inputUpdated', formState: Partial<SaveFinanceRecordFormState>): void
}>()
</script>

<template>
  <div class="first-row">
    <FormInput
      :error="props.formErrors.amount"
      label="Amount"
      :max="FINANCE_RECORD_MAX_AMOUNT"
      :min="FINANCE_RECORD_MIN_AMOUNT"
      :model-value="formState.amount"
      @update:model-value="emit('inputUpdated', { amount: $event })"
      name="amount"
      required
      :step="FINANCE_RECORD_MIN_AMOUNT"
      :type="INPUT_TYPE.NUMBER"
    />
    <FormSelect
      label="Type"
      :model-value="formState.type"
      @update:model-value="emit('inputUpdated', { type: $event })"
      :options="FINANCE_RECORD_TYPE_OPTIONS"
      required
    />
  </div>
  <FormInput
    :error="props.formErrors.description"
    label="Description"
    name="description"
    required
    :type="INPUT_TYPE.TEXT"
    :model-value="formState.description"
    @update:model-value="emit('inputUpdated', { description: $event })"
  />
  <FormInput
    :error="props.formErrors.happenedAt"
    label="Happened At"
    name="happenedAt"
    required
    :type="INPUT_TYPE.DATETIME_LOCAL"
    :model-value="formState.happenedAt"
    @update:model-value="emit('inputUpdated', { happenedAt: $event })"
  />
</template>

<style scoped>
.first-row {
  display: flex;
  gap: 1rem;
}
</style>
