<script setup lang="ts">
// External
import { provide } from 'vue'

// Internal
import AddFinanceRecordButton from '@features/financeRecords/components/AddFinanceRecordButton.vue'
import CreateFinanceRecordModal from '@features/financeRecords/components/CreateFinanceRecordModal.vue'
import DeleteFinanceRecordModal from '@features/financeRecords/components/DeleteFinanceRecordModal.vue'
import EditFinanceRecordModal from '@features/financeRecords/components/EditFinanceRecordModal.vue'
import FinanceRecordList from '@features/financeRecords/components/FinanceRecordList.vue'
import Heading from '@shared/components/Heading.vue'
import PageLayout from '@shared/layouts/PageLayout.vue'
import SearchFiltersSection from '@features/financeRecords/components/SearchFinanceRecordsSection.vue'

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
    <SearchFiltersSection />
    <FinanceRecordList />
    <AddFinanceRecordButton />

    <CreateFinanceRecordModal />
    <EditFinanceRecordModal />
    <DeleteFinanceRecordModal />
  </PageLayout>
</template>
