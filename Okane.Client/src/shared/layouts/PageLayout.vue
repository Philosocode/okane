<template>
  <div class="root">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.root {
  margin-left: var(--spacing-md);
  margin-right: var(--spacing-md);
  max-width: 50em;
}

@include respond(md) {
  .root {
    margin: 0 auto;
  }
}
</style>
