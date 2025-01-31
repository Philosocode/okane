<script setup lang="ts">
// Internal
import Kicker from '@shared/components/typography/Kicker.vue'
</script>

<template>
  <Kicker class="label" tag="label" v-bind="$attrs">
    <slot />
  </Kicker>
</template>

<style scoped>
.label {
  display: inline-block;
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-2xs);
}
</style>
