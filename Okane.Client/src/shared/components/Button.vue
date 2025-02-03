<script setup lang="ts">
// External
import { computed, onMounted, useTemplateRef } from 'vue'

export type ButtonProps = {
  disabled?: boolean
  focusOnMount?: boolean
  variant?: 'callToAction' | 'warning'
}

const props = defineProps<ButtonProps>()

const buttonRef = useTemplateRef<HTMLButtonElement>('buttonRef')
defineExpose({ buttonRef })

const classes = computed(() => ({
  base: true,
  'call-to-action': !props.disabled && props.variant === 'callToAction',
  warning: !props.disabled && props.variant === 'warning',
}))

onMounted(() => {
  if (props.focusOnMount) buttonRef.value?.focus()
})
</script>

<template>
  <button ref="buttonRef" :class="classes" :disabled="props.disabled" v-bind="$attrs">
    <slot />
  </button>
</template>

<style scoped lang="scss">
.base {
  background-color: transparent;
  border: var(--border-main);
  color: var(--color-text);
  cursor: pointer;
  font-weight: 600;
  padding: var(--space-2xs) var(--space-md);

  &:hover,
  &:active,
  &:focus {
    background-color: var(--color-main-gray-deep);
  }

  &:disabled {
    background-color: var(--color-main-gray-dim);
    border-color: transparent;
    color: var(--color-text-dim);
  }
}

.call-to-action {
  background-color: var(--color-accent);
  border-color: var(--color-accent-dim);

  &:hover,
  &:active,
  &:focus {
    background-color: var(--color-accent-deep);
  }

  &:focus {
    --color-focus-outline: var(--color-accent-dim);
  }
}

.warning {
  background-color: var(--color-error);
  border-color: var(--color-error-dim);

  &:hover,
  &:active,
  &:focus {
    background-color: var(--color-error-deep);
  }

  &:focus {
    --color-focus-outline: var(--color-error-dim);
  }
}
</style>
