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
import SearchFiltersSection from '@features/financeRecords/components/searchFinanceRecords/SearchFiltersSection.vue'
import TotalRevenueAndExpenses from '@features/financeRecords/components/TotalRevenueAndExpenses.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import {
  DELETE_FINANCE_RECORD_ID_SYMBOL,
  useDeleteFinanceRecordId,
} from '@features/financeRecords/providers/deleteFinanceRecordIdProvider'
import {
  SAVE_FINANCE_RECORD_SYMBOL,
  useSaveFinanceRecordProvider,
} from '@features/financeRecords/providers/saveFinanceRecordProvider'
import {
  SEARCH_FINANCE_RECORDS_SYMBOL,
  useSearchFinanceRecordsProvider,
} from '@features/financeRecords/providers/searchFinanceRecordsProvider'

provide(DELETE_FINANCE_RECORD_ID_SYMBOL, useDeleteFinanceRecordId())
provide(SAVE_FINANCE_RECORD_SYMBOL, useSaveFinanceRecordProvider())
provide(SEARCH_FINANCE_RECORDS_SYMBOL, useSearchFinanceRecordsProvider())
</script>

<template>
  <PageLayout>
    <Heading tag="h1">{{ FINANCES_COPY.FINANCES }}</Heading>
    <div class="column flow">
      <Card>
        <TotalRevenueAndExpenses />
        <SearchFiltersSection />
      </Card>
      <FinanceRecordList />
    </div>

    <CreateFinanceRecordButton />
    <CreateFinanceRecordModal />
    <EditFinanceRecordModal />
    <DeleteFinanceRecordModal />
  </PageLayout>
</template>
