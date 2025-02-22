<script setup lang="ts">
// External
import { format } from 'date-fns'
import { computed, type ComputedRef, provide, ref } from 'vue'

import { THEME_KEY } from 'vue-echarts'
import { BarChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import { use } from 'echarts/core'
import { useDark } from '@vueuse/core'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'

// Internal
import ErrorMessage from '@shared/components/typography/ErrorMessage.vue'
import FormSelect from '@shared/components/form/FormSelect.vue'
import VueChart from '@shared/components/charts/VueChart.vue'

import { DARK_MODE_STORAGE_KEY } from '@shared/constants/styles'
import { DEFAULT_FINANCES_TIME_INTERVAL } from '@features/financeRecords/constants/stats'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { SHARED_COPY } from '@shared/constants/copy'
import { TIME_INTERVAL, TIME_INTERVAL_OPTIONS } from '@shared/constants/dateTime'
import {
  BASE_CHART_OPTIONS,
  CHART_COLOR_GREEN,
  CHART_COLOR_RED,
  CHART_LOADING_OPTIONS,
} from '@shared/constants/charts'

import { type ECBasicOption } from 'echarts/types/dist/shared'

import { useQueryFinanceRecordsStats } from '@features/financeRecords/composables/useQueryFinanceRecordsStats'

use([BarChart, CanvasRenderer, GridComponent, LegendComponent, TooltipComponent])

const timeInterval = ref(DEFAULT_FINANCES_TIME_INTERVAL)

const { data: stats, isError, isLoading } = useQueryFinanceRecordsStats(timeInterval)

const isDark = useDark({
  storageKey: DARK_MODE_STORAGE_KEY,
})

const theme = computed(() => {
  return isDark.value ? 'dark' : 'light'
})

provide(THEME_KEY, theme)

const dateLabels = computed(() => {
  let formatter: (d: Date) => string

  switch (timeInterval.value) {
    case TIME_INTERVAL.DAY: {
      formatter = (d) => `${format(d, 'MMM')}\n${format(d, 'd')}`
      break
    }
    case TIME_INTERVAL.MONTH: {
      formatter = (d) => `${format(d, 'MMM')}\n${format(d, 'y')}`
      break
    }
    case TIME_INTERVAL.WEEK: {
      formatter = (d) => `${format(d, 'MMM d')}`
      break
    }
    case TIME_INTERVAL.YEAR:
    default: {
      formatter = (d) => format(d, 'y')
      break
    }
  }

  return stats.value?.dates.map((dateString) => formatter(new Date(dateString)))
})

const option: ComputedRef<ECBasicOption> = computed(() => ({
  ...BASE_CHART_OPTIONS,
  legend: {
    data: [FINANCES_COPY.STATS.REVENUES, FINANCES_COPY.STATS.EXPENSES],
    textStyle: {
      fontSize: '1rem',
    },
  },
  tooltip: {
    textStyle: {
      fontWeight: 'normal',
    },
    trigger: 'axis',
    valueFormatter(amount: number) {
      return FINANCES_COPY.MONEY({ amount })
    },
  },
  xAxis: {
    data: dateLabels.value,
    type: 'category',
  },
  yAxis: {
    axisLabel: {
      formatter(amount: number) {
        return FINANCES_COPY.MONEY({ amount })
      },
    },
    type: 'value',
  },
  series: [
    {
      color: CHART_COLOR_GREEN,
      data: stats.value?.revenuesByDate,
      name: FINANCES_COPY.STATS.REVENUES,
      type: 'bar',
    },
    {
      color: CHART_COLOR_RED,
      data: stats.value?.expensesByDate,
      name: FINANCES_COPY.STATS.EXPENSES,
      type: 'bar',
    },
  ],
}))
</script>

<template>
  <FormSelect
    class="timeInterval"
    :options="TIME_INTERVAL_OPTIONS"
    :label="SHARED_COPY.TIME_INTERVAL.LABEL"
    name="timeInterval"
    v-model="timeInterval"
    with-shadow
  />
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
  height: 30rem;

  @include respond(md) {
    height: 35rem;
  }

  @include respond(lg) {
    height: 40rem;
  }
}

.timeInterval {
  margin-block-end: var(--space-sm);
}
</style>
