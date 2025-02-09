<script setup lang="ts">
// External
import { type InputHTMLAttributes, onMounted, useTemplateRef } from 'vue'

// Internal
import ErrorMessage from '@shared/components/typography/ErrorMessage.vue'
import FormLabel from '@shared/components/form/FormLabel.vue'

import { ARIA_LIVE } from '@shared/constants/aria'
import { VISUALLY_HIDDEN_CLASS } from '@shared/constants/styles'

import { getUniqueFormControlId } from '@shared/utils/form'

interface Props {
  label: string
  modelValue: string
  name: string

  error?: string
  focusOnMount?: boolean
  type?: InputHTMLAttributes['type']
  withHiddenLabel?: boolean
}

const emit = defineEmits(['update:modelValue'])

const controlId = getUniqueFormControlId()
const inputRef = useTemplateRef<HTMLInputElement>('inputRef')
const props = defineProps<Props>()

const errorLabelId = `${controlId}-error`

onMounted(() => {
  if (props.focusOnMount) inputRef.value?.focus()
})

function handleChange(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
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
      :aria-describedby="props.error ? errorLabelId : undefined"
      :aria-invalid="props.error ? true : undefined"
      :id="controlId"
      :name="props.name"
      :type="props.type"
      :value="props.modelValue"
      @input="handleChange"
    />
    <ErrorMessage v-if="error" :aria-live="ARIA_LIVE.ASSERTIVE" class="error" :id="errorLabelId">
      {{ error }}
    </ErrorMessage>
  </div>
</template>

<style scoped lang="scss">
.error {
  margin-top: var(--space-xs);
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
