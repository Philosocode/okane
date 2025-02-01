<script setup lang="ts">
// External
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Internal
import Button from '@shared/components/Button.vue'

export type IconButtonProps = {
  icon: string
  title: string
}

const props = defineProps<IconButtonProps>()
</script>

<template>
  <Button class="icon-button" v-bind="$attrs">
    <FontAwesomeIcon :icon="props.icon" :title="props.title" />
  </Button>
</template>

<style scoped>
.icon-button {
  background-color: transparent;
  border: none;
  display: grid;
  place-items: center;
  min-height: 2rem;
  min-width: 2rem;
  padding: var(--space-2xs) var(--space-xs);
}
</style>
