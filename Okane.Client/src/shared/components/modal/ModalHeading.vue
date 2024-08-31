<script setup lang="ts">
import Heading from '@shared/components/Heading.vue'
</script>

<template>
  <Heading class="heading" tag="h3"><slot /></Heading>
</template>

<style scoped>
.heading {
  margin-block: 0;
}
</style>
