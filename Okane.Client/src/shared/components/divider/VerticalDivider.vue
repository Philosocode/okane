<script setup lang="ts">
// Internal
import { HTML_ROLE } from '@shared/constants/html'
</script>

<template>
  <div class="divider" :role="HTML_ROLE.SEPARATOR" v-bind="$attrs" />
</template>

<style>
.divider {
  background-color: var(--color-border);
  width: var(--border-width);
}
</style>
