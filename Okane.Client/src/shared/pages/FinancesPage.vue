<script setup lang="ts">
// External
import { provide } from 'vue'

// Internal
import Card from '@shared/components/wrapper/Card.vue'
import CreateFinanceRecordButton from '@features/financeRecords/components/saveFinanceRecord/CreateFinanceRecordButton.vue'
import CreateFinanceRecordModal from '@features/financeRecords/components/saveFinanceRecord/CreateFinanceRecordModal.vue'
import DeleteFinanceRecordModal from '@features/financeRecords/components/saveFinanceRecord/DeleteFinanceRecordModal.vue'
import EditFinanceRecordModal from '@features/financeRecords/components/saveFinanceRecord/EditFinanceRecordModal.vue'
import FinanceCharts from '@features/financeRecords/components/stats/FinanceCharts.vue'
import FinanceRecordList from '@features/financeRecords/components/financeRecordList/FinanceRecordList.vue'
import Heading from '@shared/components/nav/Heading.vue'
import PageLayout from '@shared/components/wrapper/PageLayout.vue'
import SearchFiltersSection from '@features/financeRecords/components/searchFilters/SearchFiltersSection.vue'
import TotalRevenuesAndExpenses from '@features/financeRecords/components/stats/TotalRevenuesAndExpenses.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import {
  DELETE_FINANCE_RECORD_SYMBOL,
  useDeleteFinanceRecordProvider,
} from '@features/financeRecords/providers/deleteFinanceRecordProvider'
import {
  SAVE_FINANCE_RECORD_SYMBOL,
  useSaveFinanceRecordProvider,
} from '@features/financeRecords/providers/saveFinanceRecordProvider'

provide(DELETE_FINANCE_RECORD_SYMBOL, useDeleteFinanceRecordProvider())
provide(SAVE_FINANCE_RECORD_SYMBOL, useSaveFinanceRecordProvider())
</script>

<template>
  <PageLayout>
    <Heading tag="h1">{{ FINANCES_COPY.FINANCES }}</Heading>
    <div class="flow">
      <section>
        <Card>
          <TotalRevenuesAndExpenses />
          <SearchFiltersSection />
        </Card>
      </section>

      <section>
        <FinanceCharts />
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
