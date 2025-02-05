<script setup lang="ts">
// Internal
import { HTML_ROLE } from '@shared/constants/html'
</script>

<template>
  <div class="divider" :role="HTML_ROLE.SEPARATOR" v-bind="$attrs" />
</template>

<style scoped>
.divider {
  background-color: var(--color-border);
  height: var(--border-width);
  width: 100%;
}
</style>
