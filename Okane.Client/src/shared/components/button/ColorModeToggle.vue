<script setup lang="ts">
// External
import { computed, ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useDark } from '@vueuse/core'

// Internal
import { DARK_MODE_STORAGE_KEY } from '@shared/constants/styles'
import { SHARED_COPY } from '@shared/constants/copy'

const isDarkWatched = useDark({
  disableTransition: false,
  storageKey: DARK_MODE_STORAGE_KEY,
})
const isDark = ref(isDarkWatched.value)

const transitionDurationMs = 50

function toggleColorMode() {
  isDark.value = !isDark.value

  // This hacky workaround is needed because useDark disables transitions while changing color mode.
  // useDark exposes a "disableTransition" option, but even when this option is set to false,
  // the handle transition doesn't work.
  setTimeout(() => {
    isDarkWatched.value = !isDarkWatched.value
  }, transitionDurationMs)
}

const icon = computed(() => {
  if (isDark.value) return 'fa-solid fa-moon'
  return 'fa-solid fa-sun'
})

const title = computed(() => {
  if (isDark.value) return SHARED_COPY.ACTIONS.SWITCH_TO_LIGHT_MODE
  return SHARED_COPY.ACTIONS.SWITCH_TO_DARK_MODE
})
</script>

<template>
  <button class="switch" @click="toggleColorMode()">
    <span
      class="handle"
      :class="{ 'is-dark': isDark }"
      :style="{ transitionDuration: `${transitionDurationMs}ms` }"
    >
      <FontAwesomeIcon class="icon" :icon="icon" :title="title" />
    </span>
  </button>
</template>

<style scoped>
.switch {
  background-color: transparent;
  border: var(--border-main);
  border-radius: var(--border-roundest);
  color: var(--color-text);
  height: 1.5rem;
  padding: 0 2px;
  width: 2.75rem;
}

.handle {
  --handle-size: 1.1rem;

  background-color: transparent;
  border: var(--border-main);
  border-radius: var(--border-roundest);
  font-size: 0.7rem;
  height: var(--handle-size);
  transform: translateX(100%);
  transition: transform ease-in-out;
  width: var(--handle-size);

  display: flex;
  align-items: center;
  justify-content: center;

  &.is-dark {
    transform: translateX(0);
  }
}

.icon {
  color: var(--color-text);
}
</style>
