<script setup lang="ts">
// External
import { inject, ref, useTemplateRef } from 'vue'

// Internal
import FormInput from '@shared/components/form/FormInput.vue'
import FormSelect from '@shared/components/form/FormSelect.vue'
import ModalActions from '@shared/components/modal/ModalActions.vue'
import FinanceRecordAmountFilter from '@features/financeRecords/components/FinanceRecordAmountFilter.vue'
import FinanceRecordHappenedAtFilter from '@features/financeRecords/components/FinanceRecordHappenedAtFilter.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { BUTTON_TYPE, INPUT_TYPE } from '@shared/constants/form'
import { SHARED_COPY } from '@shared/constants/copy'
import { SORT_DIRECTION_OPTIONS } from '@shared/constants/search'
import {
  FINANCE_RECORD_SORT_FIELD_OPTIONS,
  SEARCH_FINANCE_RECORDS_TYPE_OPTIONS,
} from '@features/financeRecords/constants/searchFinanceRecords'

import { type FinanceRecordsSearchFilters } from '@features/financeRecords/types/searchFinanceRecords'

import {
  SEARCH_FINANCE_RECORDS_SYMBOL,
  type SearchFinanceRecordsProvider,
} from '@features/financeRecords/providers/searchFinanceRecordsProvider'

const searchProvider = inject(SEARCH_FINANCE_RECORDS_SYMBOL) as SearchFinanceRecordsProvider
const formRef = useTemplateRef<HTMLFormElement>('form')
const formState = ref<FinanceRecordsSearchFilters>({ ...searchProvider.filters })

function handleChange(updates: Partial<FinanceRecordsSearchFilters>) {
  formState.value = {
    ...formState.value,
    ...updates,
  }
}

function handleCancel() {
  searchProvider.setModalIsShowing(false)
}

function handleReset() {
  formState.value = { ...searchProvider.filters }
}

function handleSubmit() {
  if (!formRef.value?.checkValidity()) return

  searchProvider.setFilters(formState.value)

  handleCancel()
}
</script>

<template>
  <div>
    <form class="form" ref="form" @submit.prevent="handleSubmit">
      <FormInput
        focus-on-mount
        :label="FINANCES_COPY.PROPERTIES.DESCRIPTION"
        v-model="formState.description"
        name="description"
        :type="INPUT_TYPE.TEXT"
      />

      <FormSelect
        :label="FINANCES_COPY.PROPERTIES.TYPE"
        name="type"
        v-model="formState.type"
        :options="SEARCH_FINANCE_RECORDS_TYPE_OPTIONS"
      />

      <FinanceRecordAmountFilter
        :amount1="formState.amount1"
        :amount2="formState.amount2"
        :amount-operator="formState.amountOperator"
        @change="handleChange"
      />

      <FinanceRecordHappenedAtFilter
        :happened-at1="formState.happenedAt1"
        :happened-at2="formState.happenedAt2"
        :happened-at-operator="formState.happenedAtOperator"
        @change="handleChange"
      />

      <div class="sort-controls">
        <FormSelect
          :label="SHARED_COPY.SEARCH.SORT_BY"
          name="sortBy"
          :options="FINANCE_RECORD_SORT_FIELD_OPTIONS"
          v-model="formState.sortField"
        />
        <FormSelect
          :label="SHARED_COPY.SEARCH.SORT_DIRECTION"
          name="sortDirection"
          :options="SORT_DIRECTION_OPTIONS"
          v-model="formState.sortDirection"
        />
      </div>

      <ModalActions>
        <button :type="BUTTON_TYPE.SUBMIT">{{ SHARED_COPY.ACTIONS.SAVE }}</button>
        <button @click="handleCancel" :type="BUTTON_TYPE.BUTTON">
          {{ SHARED_COPY.ACTIONS.CANCEL }}
        </button>

        <button class="reset-button" @click.prevent="handleReset" :type="BUTTON_TYPE.RESET">
          {{ SHARED_COPY.ACTIONS.RESET }}
        </button>
      </ModalActions>
    </form>
  </div>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.reset-button {
  margin-left: auto;
}

.sort-controls {
  display: flex;
  gap: var(--space-sm);
}
</style>
