<script setup lang="ts">
// External
import { computed, useTemplateRef } from 'vue'

// Internal
import FormInput from '@shared/components/form/FormInput.vue'
import ToggleableRangeInputs from '@shared/components/form/ToggleableRangeInputs.vue'

import { FINANCE_RECORD_MIN_AMOUNT } from '@features/financeRecords/constants/saveFinanceRecord'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { INPUT_TYPE } from '@shared/constants/form'

import { type FinanceRecordSearchFiltersFormState } from '@features/financeRecords/types/searchFilters'

export type FinanceRecordAmountFilterProps = Pick<
  FinanceRecordSearchFiltersFormState,
  'amount1' | 'amountOperator' | 'amount2'
>
const props = defineProps<FinanceRecordAmountFilterProps>()
const amount1Ref = useTemplateRef<InstanceType<typeof FormInput>>('amount1Ref')
const isShowingRange = computed(() => !props.amountOperator)

const emit = defineEmits<{
  (e: 'change', formState: Partial<FinanceRecordSearchFiltersFormState>): void
}>()

function handleFocusInput1() {
  amount1Ref.value?.inputRef?.focus()
}
</script>

<template>
  <ToggleableRangeInputs
    :focus-input1="handleFocusInput1"
    :is-showing-range="isShowingRange"
    :label="FINANCES_COPY.PROPERTIES.AMOUNT"
    :operator="props.amountOperator"
    @operator-change="emit('change', { amountOperator: $event })"
    operator-select-name="amountOperator"
  >
    <template #input1>
      <FormInput
        :model-value="props.amount1"
        @update:model-value="emit('change', { amount1: $event })"
        name="amount1"
        :label="
          isShowingRange
            ? FINANCES_COPY.SEARCH_FINANCE_RECORDS_MODAL.MIN_AMOUNT
            : FINANCES_COPY.PROPERTIES.AMOUNT
        "
        :min="0"
        ref="amount1Ref"
        :required="isShowingRange"
        :step="FINANCE_RECORD_MIN_AMOUNT"
        :type="INPUT_TYPE.NUMBER"
        with-hidden-label
      />
    </template>

    <template #input2>
      <FormInput
        :model-value="props.amount2"
        @update:model-value="emit('change', { amount2: $event })"
        name="amount2"
        :label="FINANCES_COPY.SEARCH_FINANCE_RECORDS_MODAL.MAX_AMOUNT"
        :min="0"
        required
        :step="FINANCE_RECORD_MIN_AMOUNT"
        :type="INPUT_TYPE.NUMBER"
        with-hidden-label
      />
    </template>
  </ToggleableRangeInputs>
</template>
