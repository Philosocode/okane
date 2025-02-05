<script setup lang="ts">
// External
import { onClickOutside, onKeyStroke } from '@vueuse/core'
import { ref, useTemplateRef } from 'vue'

// Internal
import IconButton from '@shared/components/button/IconButton.vue'
import ModalTrigger from '@shared/components/modal/ModalTrigger.vue'

import { SHARED_COPY } from '@shared/constants/copy'

type MenuAction = {
  onClick: () => void
  text: string
}

type Props = {
  actions: MenuAction[]
  menuId: string
}

const rootRef = useTemplateRef<HTMLDivElement>('rootRef')
const props = defineProps<Props>()
const menuIsShowing = ref(false)

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
}
</script>

<template>
  <div class="root" ref="rootRef">
    <IconButton
      aria-haspopup="true"
      :aria-controls="props.menuId"
      :aria-expanded="menuIsShowing"
      class="menu-toggle"
      icon="fa-solid fa-ellipsis-vertical"
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
        <ModalTrigger class="menu-item" role="menuitem" @click="handleClick(action.onClick)">
          {{ action.text }}
        </ModalTrigger>
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

.menu-toggle {
  align-self: flex-end;
  background: none;
  display: grid;
  place-items: center center;
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
