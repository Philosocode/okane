<script setup lang="ts">
// External
import { THEME_KEY } from 'vue-echarts'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import { use } from 'echarts/core'
import { useDark } from '@vueuse/core'
import { computed, provide } from 'vue'
import { DatasetComponent, LegendComponent, TooltipComponent } from 'echarts/components'

// Internal
import ErrorMessage from '@shared/components/typography/ErrorMessage.vue'
import VueChart from '@shared/components/charts/VueChart.vue'

import { DARK_MODE_STORAGE_KEY } from '@shared/constants/styles'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import {
  BASE_CHART_OPTIONS,
  CHART_COLOR_GREEN,
  CHART_COLOR_RED,
  CHART_LOADING_OPTIONS,
} from '@shared/constants/charts'

import { type PieChartFormatterParams } from '@shared/types/charts'

import { useQueryFinanceRecordsStats } from '@features/financeRecords/composables/useQueryFinanceRecordsStats'

use([CanvasRenderer, DatasetComponent, LegendComponent, PieChart, TooltipComponent])

const { data: stats, isLoading, isError } = useQueryFinanceRecordsStats()

const isDark = useDark({
  storageKey: DARK_MODE_STORAGE_KEY,
})

const theme = computed(() => {
  return isDark.value ? 'dark' : 'light'
})

provide(THEME_KEY, theme)

const option = computed(() => ({
  ...BASE_CHART_OPTIONS,
  tooltip: {
    trigger: 'item',
    formatter(params: PieChartFormatterParams) {
      const { data, name, percent } = params
      return `${name}: ${FINANCES_COPY.MONEY({ amount: data.value })} (${percent.toFixed(2)}%)`
    },
  },
  dataset: [
    {
      source: [
        {
          name: FINANCES_COPY.STATS.EXPENSES,
          value: stats.value?.totalExpenses ?? 0,
        },
        {
          name: FINANCES_COPY.STATS.REVENUES,
          value: stats.value?.totalRevenues ?? 0,
        },
      ],
    },
  ],
  series: [
    {
      color: [CHART_COLOR_RED, CHART_COLOR_GREEN],
      type: 'pie',
      label: {
        fontSize: '1.25rem',
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
    },
    {
      type: 'pie',
      label: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        position: 'inside',
        formatter: '{d}%',
      },
    },
  ],
}))
</script>

<template>
  <VueChart
    autoresize
    class="chart"
    :loading="isLoading"
    :loading-options="CHART_LOADING_OPTIONS"
    :option="option"
  />
  <ErrorMessage v-if="isError">{{ FINANCES_COPY.STATS.FETCH_ERROR }}</ErrorMessage>
</template>

<style scoped lang="scss">
.chart {
  height: 15rem;

  @include respond(md) {
    height: 20rem;
  }

  @include respond(lg) {
    height: 25rem;
  }
}
</style>
