<template>
  <div class="root">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.root {
  margin-left: var(--space-md);
  margin-right: var(--space-md);
  max-width: 50em;
}

@include respond(md) {
  .root {
    margin: 0 auto;
  }
}
</style>
