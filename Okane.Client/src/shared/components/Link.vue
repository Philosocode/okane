<script setup lang="ts">
// External
import { RouterLink, type RouteLocationRaw } from 'vue-router'

export type LinkProps = {
  to: RouteLocationRaw
}

const props = defineProps<LinkProps>()
</script>

<template>
  <RouterLink class="link" active-class="active" :to="props.to" v-bind="$attrs"
    ><slot
  /></RouterLink>
</template>

<style scoped lang="scss">
.link {
  border: var(--border-main);
  border-color: transparent;
  color: var(--color-accent-dim);
  display: inline-block;
  padding: var(--space-2xs) var(--space-xs);
  text-decoration: none;
  width: fit-content;

  &:hover,
  &.active {
    border-color: currentColor;
  }
}
</style>
