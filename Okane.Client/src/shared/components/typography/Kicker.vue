<script setup lang="ts">
// Internal
export type KickerProps = {
  tag?: string
}

const { tag = 'p' } = defineProps<KickerProps>()
</script>

<template>
  <component class="kicker" :is="tag" v-bind="$attrs">
    <slot />
  </component>
</template>

<style scoped>
.kicker {
  font-weight: bold;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
</style>
