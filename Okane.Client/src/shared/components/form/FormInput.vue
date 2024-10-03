<script setup lang="ts">
// External
import type { InputHTMLAttributes } from 'vue'

// Internal
import { ARIA_LIVE } from '@shared/constants/aria'
import { VISUALLY_HIDDEN_CLASS } from '@shared/constants/styles'

import { getUniqueFormControlId } from '@shared/utils/form'

export interface FormInputProps extends /* @vue-ignore */ InputHTMLAttributes {
  label: string
  name: string

  error?: string
  type?: InputHTMLAttributes['type']
  withHiddenLabel?: boolean
}

const controlId = getUniqueFormControlId()
const model = defineModel<number | string>()
const props = defineProps<FormInputProps>()

const errorLabelId = `${controlId}-error`
</script>

<template>
  <div>
    <label
      :class="{ label: true, [VISUALLY_HIDDEN_CLASS]: props.withHiddenLabel }"
      :for="controlId"
      >{{ label }}</label
    >
    <input
      class="input"
      v-bind="$attrs"
      v-model="model"
      :aria-describedby="props.error ? errorLabelId : undefined"
      :aria-invalid="props.error ? true : undefined"
      :id="controlId"
      :name="props.name"
      :type="props.type"
    />
    <p :aria-live="ARIA_LIVE.ASSERTIVE" class="error" :id="errorLabelId" v-if="error">
      {{ error }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.error {
  color: var(--color-error);
  margin-top: 0.5rem;
}

.input {
  display: block;
  width: 100%;
}

.label {
  margin-bottom: var(--space-2xs);
}
</style>
