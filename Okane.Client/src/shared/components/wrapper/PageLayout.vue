<script setup lang="ts">
type Props = {
  isNarrow?: boolean
}

const props = defineProps<Props>()
</script>

<template>
  <main class="page-layout" :class="{ narrow: props.isNarrow }">
    <slot />
  </main>
</template>

<style scoped>
.page-layout {
  margin-inline: auto;
  max-width: var(--max-content-width);
  padding-inline: var(--space-xs);
  padding-block-end: var(--space-2xl);
  width: 100%;
}

.narrow {
  max-width: 27.5rem;
}
</style>
