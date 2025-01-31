<template>
  <div class="pill" v-bind="$attrs"><slot /></div>
</template>

<style scoped lang="scss">
.pill {
  align-items: center;
  border: var(--border-main);
  display: flex;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: 600;

  @include respond(sm) {
    font-size: var(--font-size-md);
  }
}
</style>
