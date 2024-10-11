<script setup lang="ts">
// External
import { computed } from 'vue'

// Internal
import TotalAmountCell from '@features/financeRecords/components/TotalAmountCell.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import { useQueryFinanceRecordsStats } from '@features/financeRecords/composables/useQueryFinanceRecordsStats'

const { data } = useQueryFinanceRecordsStats()
const stats = computed(() => data.value?.items[0])
</script>

<template>
  <section class="root">
    <TotalAmountCell
      :amount="stats?.totalRevenue ?? 0"
      :count="stats?.revenueRecords ?? 0"
      :heading-text="FINANCES_COPY.RECORD_TYPES.REVENUE"
    />
    <div class="divider" role="separator" />
    <TotalAmountCell
      :amount="stats?.totalExpenses ?? 0"
      :count="stats?.expenseRecords ?? 0"
      :heading-text="FINANCES_COPY.STATS.EXPENSES"
    />
  </section>
</template>

<style scoped lang="scss">
.root {
  border: pxToRem(1) solid var(--color-gray-500);
  display: flex;
}

.divider {
  background-color: var(--color-gray-500);
  width: pxToRem(1);
}
</style>
