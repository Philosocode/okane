<script setup lang="ts">
// Internal
import Toast from '@shared/components/toast/Toast.vue'

import { useToastStore } from '@shared/composables/useToastStore'

const { toasts } = useToastStore()
</script>

<template>
  <Teleport to="#toaster">
    <TransitionGroup class="toaster" name="list" tag="div">
      <Toast v-for="toast in toasts" :key="toast.id" :toast="toast" />
    </TransitionGroup>
  </Teleport>
</template>

<style scoped lang="scss">
.toaster {
  display: flex;
  flex-direction: column-reverse;
  gap: 1.5rem;
  margin-inline: auto;
  position: fixed;
  bottom: 25px;
  left: 0;
  right: 0;
  width: 20rem;
  z-index: var(--z-index-toaster);
}

.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 300ms ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>
