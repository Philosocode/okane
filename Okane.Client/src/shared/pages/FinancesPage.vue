<script setup lang="ts">
// Internal
import AddFinanceRecordButton from '@features/financeRecords/components/AddFinanceRecordButton.vue'
import CreateFinanceRecordModal from '@features/financeRecords/components/CreateFinanceRecordModal.vue'
import DeleteFinanceRecordModal from '@features/financeRecords/components/DeleteFinanceRecordModal.vue'
import EditFinanceRecordModal from '@features/financeRecords/components/EditFinanceRecordModal.vue'
import FinanceRecordList from '@features/financeRecords/components/FinanceRecordList.vue'
import Heading from '@shared/components/Heading.vue'
import PageLayout from '@shared/layouts/PageLayout.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
</script>

<template>
  <PageLayout>
    <Heading tag="h1">{{ FINANCES_COPY.FINANCES }}</Heading>
    <FinanceRecordList />
    <AddFinanceRecordButton />

    <CreateFinanceRecordModal />
    <EditFinanceRecordModal />
    <DeleteFinanceRecordModal />
  </PageLayout>
</template>
