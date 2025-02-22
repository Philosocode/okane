<script setup lang="ts">
// External
import VChart from 'vue-echarts'

// The sole purpose of this component is to make it easier to mock VChart in other tests.
</script>

<template>
  <VChart v-bind="$attrs" />
</template>
