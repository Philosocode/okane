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
</script>

<template>
  <div class="first-row">
    <FormInput
      :error="props.formErrors.amount"
      label="Amount"
      :max="FINANCE_RECORD_MAX_AMOUNT"
      :min="FINANCE_RECORD_MIN_AMOUNT"
      name="amount"
      required
      :step="FINANCE_RECORD_MIN_AMOUNT"
      :type="INPUT_TYPE.NUMBER"
      v-model="props.formState.amount"
    />
    <FormSelect
      label="Type"
      v-model="formState.type"
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
    v-model="props.formState.description"
  />
  <FormInput
    :error="props.formErrors.happenedAt"
    label="Happened At"
    name="happenedAt"
    required
    :type="INPUT_TYPE.DATETIME_LOCAL"
    v-model="props.formState.happenedAt"
  />
</template>

<style scoped>
.first-row {
  display: flex;
  gap: 1rem;
}
</style>
