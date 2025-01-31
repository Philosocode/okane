<script setup lang="ts">
// External
import IconButton from '@shared/components/IconButton.vue'

type Props = {
  title: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <IconButton
    class="icon-button"
    icon="fa-solid fa-plus"
    :title="props.title"
    @click="emit('click')"
  />
</template>

<style scoped>
.icon-button {
  --button-size: clamp(2rem, 2rem + 2.5vw, 3.5rem);
  --offset: clamp(0.5rem, 0.5rem + 0.5vw, 1rem);

  background-color: var(--color-accent-deep);
  border: var(--border-main);
  border-color: var(--color-accent-dim);
  border-radius: 10rem;
  position: fixed;
  font-size: 1.25rem;
  bottom: var(--offset);
  right: var(--offset);
  height: var(--button-size);
  width: var(--button-size);
  z-index: var(--z-index-floating-create-button);

  &:hover {
    background-color: var(--color-accent);
  }
}
</style>
