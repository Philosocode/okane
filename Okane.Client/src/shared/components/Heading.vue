<script setup lang="ts">
// Internal
import type { HeadingTag } from '@shared/types/html'

type Props = {
  tag: HeadingTag
}

const props = defineProps<Props>()
</script>

<template>
  <component class="heading" :is="props.tag">
    <slot />
  </component>
</template>

<style scoped>
.heading {
  font-weight: bold;
  line-height: 1.1;
  margin-top: 0.75em;
  margin-bottom: 0.75em;
  text-wrap: balance;
}
</style>
