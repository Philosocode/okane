<script setup lang="ts">
import type { HeadingTag } from '@shared/types/html.types'

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
  margin-top: 0.75em;
  margin-bottom: 0.75em;
}
</style>
