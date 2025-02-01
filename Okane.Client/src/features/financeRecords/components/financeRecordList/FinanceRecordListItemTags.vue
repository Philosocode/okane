<script setup lang="ts">
// External
import { computed } from 'vue'

// Internal
import Kicker from '@shared/components/typography/Kicker.vue'
import Pill from '@shared/components/Pill.vue'
import VerticalDivider from '@shared/components/VerticalDivider.vue'

import { type FinanceRecord } from '@features/financeRecords/types/financeRecord'

export type FinanceRecordListItemTagsProps = Pick<FinanceRecord, 'tags' | 'type'>

const props = defineProps<FinanceRecordListItemTagsProps>()

const typeClasses = computed(() => ['type', props.type.toLowerCase()])
</script>

<template>
  <div class="tags">
    <Pill :class="typeClasses">
      <Kicker class="type">{{ props.type }}</Kicker>
    </Pill>
    <VerticalDivider v-if="props.tags.length > 0" />
    <Pill v-for="tag in props.tags" :key="tag.id" class="pill">
      {{ tag.name }}
    </Pill>
  </div>
</template>

<style scoped lang="scss">
.pill {
  padding-inline: var(--space-sm);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  gap: var(--space-sm);
  grid-column: 1 / -1;
  margin-block-start: var(--space-2xs);
  padding-block-end: var(--space-2xs);

  @include respond(sm) {
    margin-block-start: 0;
  }
}

.type {
  font-weight: 600;
  padding-block: 0.1em;
  padding-inline: var(--space-2xs);

  @include respond(sm) {
    font-size: var(--space-sm);
  }

  &.expense {
    background-color: var(--color-error-deep);
    border-color: var(--color-error-dim);
  }

  &.revenue {
    background-color: var(--color-accent-deep);
    border-color: var(--color-accent-dim);
  }
}
</style>
