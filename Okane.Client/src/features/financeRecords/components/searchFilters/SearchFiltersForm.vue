<script setup lang="ts">
// External
import { computed, inject, ref, useTemplateRef } from 'vue'

// Internal
import AppButton from '@shared/components/button/AppButton.vue'
import FinanceRecordAmountFilter from '@features/financeRecords/components/searchFilters/FinanceRecordAmountFilter.vue'
import FinanceRecordHappenedAtFilter from '@features/financeRecords/components/searchFilters/FinanceRecordHappenedAtFilter.vue'
import FinanceUserTagCombobox from '@features/financeUserTags/components/FinanceUserTagCombobox.vue'
import FormInput from '@shared/components/form/FormInput.vue'
import FormSelect from '@shared/components/form/FormSelect.vue'
import ModalActions from '@shared/components/modal/ModalActions.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'
import { SHARED_COPY } from '@shared/constants/copy'
import { SORT_DIRECTION_OPTIONS } from '@shared/constants/search'
import { BUTTON_TYPE, INPUT_TYPE } from '@shared/constants/form'
import {
  FINANCE_RECORD_SORT_FIELD_OPTIONS,
  SEARCH_FINANCE_RECORDS_TYPE_OPTIONS,
} from '@features/financeRecords/constants/searchFilters'

import { type FinanceRecordSearchFilters } from '@features/financeRecords/types/searchFilters'

import {
  FINANCE_RECORD_SEARCH_FILTERS_SYMBOL,
  type FinanceRecordSearchFiltersProvider,
} from '@features/financeRecords/providers/financeRecordSearchFiltersProvider'

const userTagTypes = computed(() => {
  if (formState.value.type === '') {
    return [FINANCE_RECORD_TYPE.EXPENSE, FINANCE_RECORD_TYPE.REVENUE]
  }

  return [formState.value.type]
})

const searchProvider = inject(
  FINANCE_RECORD_SEARCH_FILTERS_SYMBOL,
) as FinanceRecordSearchFiltersProvider
const formRef = useTemplateRef<HTMLFormElement>('form')
const formState = ref<FinanceRecordSearchFilters>({ ...searchProvider.filters })

function handleChange(updates: Partial<FinanceRecordSearchFilters>) {
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
        :model-value="formState.type"
        @update:model-value="(type) => handleChange({ tags: [], type })"
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

      <FinanceUserTagCombobox
        id="search-finance-records-tag-combobox"
        :selected-tags="formState.tags"
        :tag-types="userTagTypes"
        @change="(tags) => handleChange({ tags })"
      />

      <ModalActions>
        <AppButton :type="BUTTON_TYPE.SUBMIT" variant="callToAction">{{
          SHARED_COPY.ACTIONS.SAVE
        }}</AppButton>
        <AppButton @click="handleCancel" :type="BUTTON_TYPE.BUTTON">
          {{ SHARED_COPY.ACTIONS.CANCEL }}
        </AppButton>

        <AppButton class="reset-button" @click.prevent="handleReset" :type="BUTTON_TYPE.RESET">
          {{ SHARED_COPY.ACTIONS.RESET }}
        </AppButton>
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
  height: 3.5rem;
  gap: var(--space-md);
}
</style>
