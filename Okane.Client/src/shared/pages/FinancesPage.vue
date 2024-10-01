<script setup lang="ts">
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
