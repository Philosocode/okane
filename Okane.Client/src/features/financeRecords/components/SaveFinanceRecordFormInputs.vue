<script setup lang="ts">
// Internal
import FormInput from '@shared/components/form/FormInput.vue'
import FormSelect from '@shared/components/form/FormSelect.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { INPUT_TYPE } from '@shared/constants/form'
import {
  FINANCE_RECORD_DESCRIPTION_MAX_LENGTH,
  FINANCE_RECORD_MAX_AMOUNT,
  FINANCE_RECORD_MIN_AMOUNT,
  FINANCE_RECORD_TYPE_OPTIONS,
} from '@features/financeRecords/constants/saveFinanceRecord'

import type {
  SaveFinanceRecordFormErrors,
  SaveFinanceRecordFormState,
} from '@features/financeRecords/types/saveFinanceRecord'

type Props = {
  formState: SaveFinanceRecordFormState
  formErrors: SaveFinanceRecordFormErrors
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'change', formState: Partial<SaveFinanceRecordFormState>): void
}>()
</script>

<template>
  <div class="first-row">
    <FormInput
      :error="props.formErrors.amount"
      focus-on-mount
      :label="FINANCES_COPY.PROPERTIES.AMOUNT"
      :max="FINANCE_RECORD_MAX_AMOUNT"
      :min="FINANCE_RECORD_MIN_AMOUNT"
      :model-value="formState.amount"
      @update:model-value="emit('change', { amount: $event })"
      name="amount"
      required
      :step="FINANCE_RECORD_MIN_AMOUNT"
      :type="INPUT_TYPE.NUMBER"
    />
    <FormSelect
      :label="FINANCES_COPY.PROPERTIES.TYPE"
      :model-value="formState.type"
      @update:model-value="emit('change', { type: $event })"
      :options="FINANCE_RECORD_TYPE_OPTIONS"
      name="type"
      required
    />
  </div>
  <FormInput
    :error="props.formErrors.description"
    :label="FINANCES_COPY.PROPERTIES.DESCRIPTION"
    :maxlength="FINANCE_RECORD_DESCRIPTION_MAX_LENGTH"
    name="description"
    :model-value="formState.description"
    @update:model-value="emit('change', { description: $event })"
    required
    :type="INPUT_TYPE.TEXT"
  />
  <FormInput
    :error="props.formErrors.happenedAt"
    :label="FINANCES_COPY.PROPERTIES.HAPPENED_AT"
    name="happenedAt"
    required
    :type="INPUT_TYPE.DATETIME_LOCAL"
    :model-value="formState.happenedAt"
    @update:model-value="emit('change', { happenedAt: $event })"
  />
</template>

<style scoped>
.first-row {
  display: flex;
  gap: 1rem;
}
</style>
