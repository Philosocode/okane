<script setup lang="ts">
// External
import { provide, ref } from 'vue'

// Internal
import FinanceRecordList from '@features/financeRecords/components/FinanceRecordList.vue'
import Heading from '@shared/components/Heading.vue'
import PageLayout from '@shared/layouts/PageLayout.vue'
import SaveFinanceRecordForm from '@features/financeRecords/components/SaveFinanceRecordForm.vue'

import type { FinanceRecordSearchFilters } from '@features/financeRecords/types/searchFilters'
import {
  DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
  FINANCE_RECORD_SEARCH_FILTERS_KEY,
} from '@features/financeRecords/constants/searchFilters'

const financeRecordSearchFilters = ref<FinanceRecordSearchFilters>(
  DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
)

provide(FINANCE_RECORD_SEARCH_FILTERS_KEY, financeRecordSearchFilters)
</script>

<template>
  <PageLayout>
    <Heading tag="h1">Finances</Heading>
    <p>You are logged in!</p>
    <SaveFinanceRecordForm />
    <FinanceRecordList />
  </PageLayout>
</template>
