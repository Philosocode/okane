<script setup lang="ts">
// External
import { provide } from 'vue'

// Internal
import Card from '@shared/components/wrappers/Card.vue'
import CreateFinanceRecordButton from '@features/financeRecords/components/CreateFinanceRecordButton.vue'
import CreateFinanceRecordModal from '@features/financeRecords/components/CreateFinanceRecordModal.vue'
import DeleteFinanceRecordModal from '@features/financeRecords/components/DeleteFinanceRecordModal.vue'
import EditFinanceRecordModal from '@features/financeRecords/components/EditFinanceRecordModal.vue'
import FinanceRecordList from '@features/financeRecords/components/FinanceRecordList.vue'
import Heading from '@shared/components/Heading.vue'
import PageLayout from '@shared/components/wrappers/PageLayout.vue'
import SearchFiltersSection from '@features/financeRecords/components/searchFilters/SearchFiltersSection.vue'
import TotalRevenueAndExpenses from '@features/financeRecords/components/TotalRevenueAndExpenses.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import {
  DELETE_FINANCE_RECORD_SYMBOL,
  useDeleteFinanceRecordProvider,
} from '@features/financeRecords/providers/deleteFinanceRecordProvider'
import {
  SAVE_FINANCE_RECORD_SYMBOL,
  useSaveFinanceRecordProvider,
} from '@features/financeRecords/providers/saveFinanceRecordProvider'
import {
  FINANCE_RECORD_SEARCH_FILTERS_SYMBOL,
  useFinanceRecordSearchFiltersProvider,
} from '@features/financeRecords/providers/financeRecordSearchFiltersProvider'

provide(DELETE_FINANCE_RECORD_SYMBOL, useDeleteFinanceRecordProvider())
provide(SAVE_FINANCE_RECORD_SYMBOL, useSaveFinanceRecordProvider())
provide(FINANCE_RECORD_SEARCH_FILTERS_SYMBOL, useFinanceRecordSearchFiltersProvider())
</script>

<template>
  <PageLayout>
    <Heading tag="h1">{{ FINANCES_COPY.FINANCES }}</Heading>
    <div class="flow">
      <section>
        <Card>
          <TotalRevenueAndExpenses />
          <SearchFiltersSection />
        </Card>
      </section>

      <section>
        <FinanceRecordList />
      </section>
    </div>

    <CreateFinanceRecordButton />
    <CreateFinanceRecordModal />
    <EditFinanceRecordModal />
    <DeleteFinanceRecordModal />
  </PageLayout>
</template>
