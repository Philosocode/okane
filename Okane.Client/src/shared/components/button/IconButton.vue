<script setup lang="ts">
// External
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useTemplateRef } from 'vue'

export type IconButtonProps = {
  icon: string
  title: string
}

const props = defineProps<IconButtonProps>()

const buttonRef = useTemplateRef('buttonRef')
defineExpose({ buttonRef })
</script>

<template>
  <button class="icon-button" ref="buttonRef" v-bind="$attrs">
    <FontAwesomeIcon :icon="props.icon" :title="props.title" />
  </button>
</template>

<style scoped>
.icon-button {
  background-color: transparent;
  border: none;
  color: var(--color-text);
  display: grid;
  place-items: center;
  min-height: 2rem;
  min-width: 2rem;
  padding: var(--space-2xs) var(--space-xs);

  &:hover,
  &:active,
  &:focus {
    background-color: var(--color-main-gray-deep);
  }
}
</style>
