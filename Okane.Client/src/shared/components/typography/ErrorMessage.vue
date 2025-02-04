<template>
  <p class="error" v-bind="$attrs"><slot /></p>
</template>

<style scoped>
.error {
  color: var(--color-error);
}
</style>
