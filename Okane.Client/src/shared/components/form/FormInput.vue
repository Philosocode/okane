<script setup lang="ts">
// External
import { type InputHTMLAttributes, onMounted, useTemplateRef } from 'vue'

// Internal
import FormLabel from '@shared/components/form/FormLabel.vue'

import { ARIA_LIVE } from '@shared/constants/aria'
import { VISUALLY_HIDDEN_CLASS } from '@shared/constants/styles'

import { getUniqueFormControlId } from '@shared/utils/form'

export interface FormInputProps extends /* @vue-ignore */ InputHTMLAttributes {
  label: string
  name: string

  error?: string
  focusOnMount?: boolean
  type?: InputHTMLAttributes['type']
  withHiddenLabel?: boolean
}

const controlId = getUniqueFormControlId()
const inputRef = useTemplateRef<HTMLInputElement>('inputRef')
const model = defineModel<number | string>()
const props = defineProps<FormInputProps>()

const errorLabelId = `${controlId}-error`

onMounted(() => {
  if (props.focusOnMount) inputRef.value?.focus()
})
</script>

<template>
  <div>
    <FormLabel :class="{ [VISUALLY_HIDDEN_CLASS]: props.withHiddenLabel }" :for="controlId">{{
      label
    }}</FormLabel>
    <input
      class="input form-input"
      ref="inputRef"
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
  background-color: transparent;
  border: var(--border-main);
  border-radius: var(--border-radius);
  color: var(--color-text);
  display: block;
  width: 100%;
}
</style>
