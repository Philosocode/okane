<template>
  <div class="card" v-bind="$attrs"><slot /></div>
</template>

<style scoped>
.card {
  border: var(--border-main);
}
</style>
