<script setup lang="ts">
// External
import { watchEffect } from 'vue'

// Internal
import TotalAmountCell from '@features/financeRecords/components/stats/TotalAmountCell.vue'
import VerticalDivider from '@shared/components/divider/VerticalDivider.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'

import { useQueryFinanceRecordsStats } from '@features/financeRecords/composables/useQueryFinanceRecordsStats'
import { useToastStore } from '@shared/composables/useToastStore'

const toastStore = useToastStore()
const { data: stats, isError } = useQueryFinanceRecordsStats()

watchEffect(() => {
  if (isError.value) {
    toastStore.createToast(FINANCES_COPY.STATS.FETCH_ERROR, 'error')
  }
})
</script>

<template>
  <div class="root">
    <TotalAmountCell
      :amount="stats?.totalRevenues ?? 0"
      :class="{ revenue: true, empty: !stats?.totalRevenues, hidden: !stats }"
      :count="stats?.revenueRecords ?? 0"
      :heading-text="FINANCES_COPY.RECORD_TYPES.REVENUE"
      :loading="!stats"
      :type="FINANCE_RECORD_TYPE.REVENUE"
    />
    <VerticalDivider />
    <TotalAmountCell
      :amount="stats?.totalExpenses ?? 0"
      :class="{ expenses: true, empty: !stats?.totalExpenses, hidden: !stats }"
      :count="stats?.expenseRecords ?? 0"
      :heading-text="FINANCES_COPY.STATS.EXPENSES"
      :loading="!stats"
      :type="FINANCE_RECORD_TYPE.EXPENSE"
    />
  </div>
</template>

<style scoped lang="scss">
.root {
  border-bottom: var(--border-main);
  display: flex;
}

.divider {
  background-color: var(--color-border);
  width: var(--border-width);
}

.revenue {
  color: var(--color-accent-dim);
}

.expenses {
  color: var(--color-error-deep);
}

// Empty must go after revenue / expenses so that it overrides them.
.empty {
  color: var(--color-text-dim);
}
</style>
