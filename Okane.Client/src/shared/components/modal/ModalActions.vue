<script setup lang="ts"></script>

<template>
  <div class="root">
    <slot />
  </div>
</template>

<style scoped>
.root {
  display: flex;
  gap: var(--space-md);
}
</style>
