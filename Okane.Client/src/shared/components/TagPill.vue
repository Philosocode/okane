<script setup lang="ts">
type Props = {
  tagName: string
}

const props = defineProps<Props>()
</script>

<template>
  <div class="tag">{{ props.tagName }}</div>
</template>

<style scoped>
.tag {
  border: 1px solid var(--color-card-border);
  border-radius: 4px;
  display: inline-block;
  font-size: var(--font-size-sm);
  min-width: 3rem;
  padding-inline: 0.5rem;
  text-align: center;
}
</style>
