<script setup lang="ts">
// External
import { format } from 'date-fns'

// Internal
import Card from '@shared/components/wrappers/Card.vue'
import FinanceRecordTags from '@features/financeRecords/components/financeRecordList/FinanceRecordTags.vue'
import FinanceRecordTypePill from '@features/financeRecords/components/financeRecordList/FinanceRecordTypePill.vue'
import Kicker from '@shared/components/typography/Kicker.vue'

import { COMMON_DATE_TIME_FORMAT } from '@shared/constants/dateTime'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import { type FinanceRecord } from '@features/financeRecords/types/financeRecord'

export type FinanceRecordSummaryProps = {
  financeRecord: FinanceRecord
}

const props = defineProps<FinanceRecordSummaryProps>()
</script>

<template>
  <Card class="flow root">
    <Kicker class="kicker">
      {{ format(props.financeRecord.happenedAt, COMMON_DATE_TIME_FORMAT) }}
    </Kicker>
    <FinanceRecordTypePill class="type-pill" :type="props.financeRecord.type" />
    <p>
      {{
        FINANCES_COPY.MONEY({ amount: props.financeRecord.amount, type: props.financeRecord.type })
      }}
    </p>
    <p class="description">
      {{ FINANCES_COPY.PROPERTIES.DESCRIPTION }}: {{ props.financeRecord.description }}
    </p>
    <div class="row">
      <FinanceRecordTags :tags="props.financeRecord.tags" />
    </div>
  </Card>
</template>

<style scoped>
.root {
  --flow-space: var(--space-xs);
  padding: var(--space-sm);
}

.kicker {
  font-size: var(--font-size-sm);
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}
</style>
