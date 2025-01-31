<script setup lang="ts">
// Internal
import Kicker from '@shared/components/typography/Kicker.vue'

import { SHARED_COPY } from '@shared/constants/copy'
</script>

<template>
  <footer>
    <Kicker class="copyright">{{ SHARED_COPY.COPYRIGHT }}</Kicker>
  </footer>
</template>

<style scoped lang="scss">
.copyright {
  bottom: var(--space-sm);
  color: var(--color-text-dim);
  font-size: var(--font-size-xs);
  position: absolute;
  text-align: center;
  width: 100%;

  @include respond(sm) {
    font-size: var(--font-size-sm);
  }
}
</style>
