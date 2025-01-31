<template>
  <ul class="bulleted-list">
    <slot />
  </ul>
</template>

<style scoped>
.bulleted-list {
  list-style-type: disc;
  padding-inline-start: 1em;
}
</style>
