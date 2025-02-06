<script setup lang="ts">
// External
import { onClickOutside, onKeyStroke } from '@vueuse/core'
import { ref, useTemplateRef } from 'vue'

// Internal
import AppButton from '@shared/components/button/AppButton.vue'
import IconButton from '@shared/components/button/IconButton.vue'

import { SHARED_COPY } from '@shared/constants/copy'

import { useModalTriggerStore } from '@shared/composables/useModalTriggerStore'

type MenuAction = {
  onClick: () => void
  text: string
}

type Props = {
  actions: MenuAction[]
  menuId: string
}

const rootRef = useTemplateRef('rootRef')
const toggleRef = useTemplateRef('toggleRef')
const props = defineProps<Props>()
const menuIsShowing = ref(false)
const triggerStore = useModalTriggerStore()

onClickOutside(rootRef, () => {
  if (menuIsShowing.value) menuIsShowing.value = false
})

onKeyStroke(
  'Escape',
  () => {
    menuIsShowing.value = false
  },
  { target: rootRef },
)

function handleClick(callback: MenuAction['onClick']) {
  callback()
  menuIsShowing.value = false
  triggerStore.setModalTrigger(toggleRef.value?.buttonRef ?? null)
}
</script>

<template>
  <div class="root" ref="rootRef">
    <IconButton
      aria-haspopup="true"
      :aria-controls="props.menuId"
      :aria-expanded="menuIsShowing"
      icon="fa-solid fa-ellipsis-vertical"
      ref="toggleRef"
      :title="SHARED_COPY.MENU.TOGGLE_MENU"
      @click="menuIsShowing = !menuIsShowing"
    />

    <ul v-if="menuIsShowing" class="menu" :id="props.menuId" role="menu">
      <li
        v-for="action in props.actions"
        :key="action.text"
        class="button-wrapper"
        role="presentation"
      >
        <AppButton class="menu-item" role="menuitem" @click="handleClick(action.onClick)">
          {{ action.text }}
        </AppButton>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.root {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  &:last-child {
    border-top: var(--border-main);
  }
}

.menu {
  border: var(--border-main);
  min-width: 6rem;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  right: 0;
  transform: translate(0.15rem, 6rem);
  z-index: var(--z-index-toggle-menu);
}

.button-wrapper:not(:last-child) {
  border-bottom: var(--border-main);
}

.menu-item {
  background-color: var(--color-site-bg);
  border: none;
  padding: var(--space-xs);
  width: 100%;
}
</style>
