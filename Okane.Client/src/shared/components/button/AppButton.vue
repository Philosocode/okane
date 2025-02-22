<script setup lang="ts">
// External
import { computed, onMounted, useTemplateRef } from 'vue'

type Props = {
  disabled?: boolean
  focusOnMount?: boolean
  variant?: 'callToAction' | 'warning'
  withShadow?: boolean
}

const props = defineProps<Props>()

const buttonRef = useTemplateRef<HTMLButtonElement>('buttonRef')
defineExpose({ buttonRef })

const classes = computed(() => ({
  base: true,
  'call-to-action': !props.disabled && props.variant === 'callToAction',
  warning: !props.disabled && props.variant === 'warning',
  'after-shadow': props.withShadow,
  'with-shadow': props.withShadow,
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
  background-color: var(--color-site-bg);
  border: var(--border-main);
  color: var(--color-text);
  cursor: pointer;
  font-weight: 600;
  padding: var(--space-2xs) var(--space-md);
  position: relative;
  transition: background-color 200ms ease-in-out;

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

.with-shadow::after {
  height: calc(100% + var(--border-width));
  transform: translate(8px, 5px);
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
