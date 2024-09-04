<script setup lang="ts">
// External
import { provide, ref } from 'vue'

// Internal
import AddFinanceRecordButton from '@features/financeRecords/components/AddFinanceRecordButton.vue'
import FinanceRecordList from '@features/financeRecords/components/FinanceRecordList.vue'
import Heading from '@shared/components/Heading.vue'
import PageLayout from '@shared/layouts/PageLayout.vue'
import SaveFinanceRecordForm from '@features/financeRecords/components/SaveFinanceRecordForm.vue'

import { AUTH_COPY } from '@features/auth/constants/copy'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import {
  DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
  FINANCE_RECORD_SEARCH_FILTERS_KEY,
} from '@features/financeRecords/constants/searchFilters'

import { type FinanceRecordSearchFilters } from '@features/financeRecords/types/searchFilters'

import { useModal } from '@shared/composables/useModal'

const {
  showModal: showSaveModal,
  modalIsShowing: saveModalIsShowing,
  closeModal: closeSaveModal,
} = useModal()

const financeRecordSearchFilters = ref<FinanceRecordSearchFilters>(
  DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
)

provide(FINANCE_RECORD_SEARCH_FILTERS_KEY, financeRecordSearchFilters)
</script>

<template>
  <PageLayout>
    <Heading tag="h1">{{ FINANCES_COPY.FINANCES }}</Heading>
    <p>{{ AUTH_COPY.YOU_ARE_LOGGED_IN }}</p>
    <SaveFinanceRecordForm
      :is-showing="saveModalIsShowing"
      :search-filters="financeRecordSearchFilters"
      @close="closeSaveModal"
    />
    <FinanceRecordList />
    <AddFinanceRecordButton @click="showSaveModal" />
  </PageLayout>
</template>
