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

h1 {
  font-size: var(--font-size-3xl);
}

h2 {
  font-size: var(--font-size-2xl);
}

h3 {
  font-size: var(--font-size-xl);
}

h4 {
  font-size: var(--font-size-lg);
}

h5 {
  font-size: var(--font-size-md);
}

h6 {
  font-size: var(--font-size-sm);
}
</style>
