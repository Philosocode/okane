<script setup lang="ts">
// External
import { computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useDark } from '@vueuse/core'

// Internal
import { DARK_MODE_STORAGE_KEY } from '@shared/constants/styles'
import { SHARED_COPY } from '@shared/constants/copy'

const isDark = useDark({
  storageKey: DARK_MODE_STORAGE_KEY,
})

const icon = computed(() => {
  if (isDark.value) return 'fa-solid fa-moon'
  return 'fa-solid fa-sun'
})

const title = computed(() => {
  if (isDark.value) return SHARED_COPY.ACTIONS.SWITCH_TO_LIGHT_MODE
  return SHARED_COPY.ACTIONS.SWITCH_TO_DARK_MODE
})

function toggleColorMode() {
  isDark.value = !isDark.value
}
</script>

<template>
  <button class="switch" :class="{ 'is-dark': isDark }" @click="toggleColorMode">
    <span class="handle">
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

  display: flex;
  align-items: center;

  &.is-dark {
    justify-content: flex-end;
  }
}

.handle {
  --handle-size: 1.1rem;

  background-color: transparent;
  border: var(--border-main);
  border-radius: var(--border-roundest);
  font-size: 0.7rem;
  height: var(--handle-size);
  width: var(--handle-size);

  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  color: var(--color-text);
}
</style>
