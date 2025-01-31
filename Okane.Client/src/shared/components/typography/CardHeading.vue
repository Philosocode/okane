<script setup lang="ts">
// Internal
import Kicker from '@shared/components/typography/Kicker.vue'
</script>

<template>
  <Kicker class="card-heading" tag="h3" v-bind="$attrs"><slot /></Kicker>
</template>

<style scoped lang="scss">
.card-heading {
  font-size: var(--font-size-md);
  margin-block: 0;
}
</style>
