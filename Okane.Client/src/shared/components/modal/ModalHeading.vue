<script setup lang="ts">
// Internal
import CardHeading from '@shared/components/typography/CardHeading.vue'
</script>

<template>
  <CardHeading tag="h3" v-bind="$attrs"><slot /></CardHeading>
</template>
