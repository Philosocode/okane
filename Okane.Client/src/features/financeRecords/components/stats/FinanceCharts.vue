<script setup lang="ts">
// External
import { defineAsyncComponent } from 'vue'
import { useToggle } from '@vueuse/core'

// Internal
import AppButton from '@shared/components/button/AppButton.vue'
import Card from '@shared/components/wrapper/Card.vue'
import CardHeading from '@shared/components/typography/CardHeading.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { SHARED_COPY } from '@shared/constants/copy'
import { TEST_IDS } from '@shared/constants/testIds'

const FinancesPieChart = defineAsyncComponent(
  () => import('@features/financeRecords/components/stats/FinancesPieChart.vue'),
)
const FinancesOverTimeChart = defineAsyncComponent(
  () => import('@features/financeRecords/components/stats/FinancesOverTimeChart.vue'),
)

const [isShowingCharts, toggleCharts] = useToggle(false)
</script>

<template>
  <Card class="card">
    <CardHeading>{{ FINANCES_COPY.CHARTS.HEADING }}</CardHeading>
    <AppButton class="toggle-button" with-shadow @click="toggleCharts()">{{
      isShowingCharts ? SHARED_COPY.ACTIONS.HIDE : SHARED_COPY.ACTIONS.SHOW
    }}</AppButton>

    <!--suppress VueUnrecognizedDirective -->
    <div :data-testid="TEST_IDS.FINANCE_CHARTS_CONTAINER" v-lazy-show="isShowingCharts">
      <FinancesPieChart />
      <FinancesOverTimeChart />
    </div>
  </Card>
</template>

<style scoped lang="scss">
.card {
  padding: var(--space-md);
}

.toggle-button {
  margin-block-start: var(--space-xs);
}
</style>
