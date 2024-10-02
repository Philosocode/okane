<script setup lang="ts">
// Internal
import FormSelect from '@shared/components/form/FormSelect.vue'

import { SHARED_COPY } from '@shared/constants/copy'
import { ALL_COMPARISON_OPERATOR_OPTIONS, COMPARISON_OPERATOR } from '@shared/constants/search'

type Props = {
  isShowingRange: boolean
  label: string

  operator?: COMPARISON_OPERATOR
  operatorSelectName: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'operatorChange', operator?: COMPARISON_OPERATOR): void
}>()

function emitChange(update?: COMPARISON_OPERATOR) {
  emit('operatorChange', update)
}

function useSingle() {
  emitChange(COMPARISON_OPERATOR.GTE)
}

function useRange() {
  emitChange(undefined)
}

function toggleRange() {
  if (props.isShowingRange) {
    useSingle()
  } else {
    useRange()
  }
}
</script>

<template>
  <fieldset class="fieldset">
    <legend class="legend">{{ props.label }}</legend>

    <div class="column">
      <div class="row">
        <FormSelect
          v-if="!isShowingRange"
          :model-value="props.operator"
          @update:model-value="emitChange"
          :label="SHARED_COPY.SEARCH.OPERATOR"
          :name="props.operatorSelectName"
          :options="ALL_COMPARISON_OPERATOR_OPTIONS"
          with-hidden-label
        />
        <span v-else>{{ COMPARISON_OPERATOR.GTE }}</span>

        <slot name="input1" />
      </div>

      <template v-if="isShowingRange">
        <p class="and">
          {{ SHARED_COPY.CONJUNCTIONS.AND }}
        </p>

        <div class="row">
          <span>{{ COMPARISON_OPERATOR.LTE }}</span>

          <slot name="input2" />
        </div>
      </template>
    </div>

    <button class="range-toggle" @click="toggleRange" type="button">
      {{ props.isShowingRange ? SHARED_COPY.SEARCH.USE_SINGLE : SHARED_COPY.SEARCH.USE_RANGE }}
    </button>
  </fieldset>
</template>

<style scoped>
.and {
  font-size: var(--font-size-sm);
  text-align: center;
  text-transform: uppercase;
}

.column {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: var(--space-2xs);
  width: max-content;
}

.fieldset {
  border: 0;
  padding: 0;
}

.legend {
  margin-bottom: var(--space-2xs);
}

.range-toggle {
  margin-top: var(--space-xs);
}

.row {
  display: flex;
  flex-direction: row;
  gap: var(--space-sm);
}
</style>
