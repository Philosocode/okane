<script setup lang="ts">
// Internal
import AppButton from '@shared/components/AppButton.vue'
import FormSelect from '@shared/components/form/FormSelect.vue'
import Kicker from '@shared/components/typography/Kicker.vue'

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
    <Kicker class="legend" tag="legend">{{ props.label }}</Kicker>

    <div class="inputs row">
      <div class="row">
        <FormSelect
          v-if="!isShowingRange"
          class="operator"
          :model-value="props.operator"
          @update:model-value="emitChange"
          :label="SHARED_COPY.SEARCH.OPERATOR"
          :name="props.operatorSelectName"
          :options="ALL_COMPARISON_OPERATOR_OPTIONS"
          with-hidden-label
        />
        <span v-else class="operator">{{ COMPARISON_OPERATOR.GTE }}</span>

        <slot name="input1" />
      </div>

      <template v-if="isShowingRange">
        <Kicker class="and">
          {{ SHARED_COPY.CONJUNCTIONS.AND }}
        </Kicker>

        <div class="row">
          <span class="operator">{{ COMPARISON_OPERATOR.LTE }}</span>

          <slot name="input2" />
        </div>
      </template>
    </div>

    <AppButton class="range-toggle" @click="toggleRange" type="button">
      {{ props.isShowingRange ? SHARED_COPY.SEARCH.USE_SINGLE : SHARED_COPY.SEARCH.USE_RANGE }}
    </AppButton>
  </fieldset>
</template>

<style scoped lang="scss">
.and {
  font-size: var(--font-size-sm);
  margin: 0 var(--space-xs);
  text-align: center;
}

.fieldset {
  border: 0;
  padding: 0;
}

.legend {
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-2xs);
}

.range-toggle {
  margin-top: var(--space-xs);
}

.operator {
  font-size: var(--font-size-lg);
  margin-right: var(--space-xs);
}

.row {
  display: flex;
  align-items: center;
  width: fit-content;
}

// On very narrow screens, both inputs won't fit on the same row, so we need to
// move them onto separate rows.
@media only screen and (max-width: 30em) {
  .and {
    margin-block: var(--space-2xs);
  }

  .inputs {
    display: block;
  }
}
</style>
