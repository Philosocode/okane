<script setup lang="ts">
// External
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

type Props = {
  title: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <button class="button" @click="emit('click')">
    <FontAwesomeIcon icon="fa-solid fa-plus" :title="props.title" />
  </button>
</template>

<style scoped>
.button {
  --button-size: clamp(2rem, 2rem + 2.5vw, 3rem);
  --offset: clamp(0.5rem, 0.5rem + 0.5vw, 1rem);

  border: none;
  border-radius: 50%;
  font-size: 1.25rem;
  position: fixed;
  bottom: var(--offset);
  right: var(--offset);
  height: var(--button-size);
  width: var(--button-size);
}
</style>
