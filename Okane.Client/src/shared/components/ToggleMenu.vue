<script setup lang="ts">
// External
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { onClickOutside } from '@vueuse/core'
import { ref, useTemplateRef } from 'vue'

// Internal
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

function handleClick(callback: MenuAction['onClick']) {
  callback()
  menuIsShowing.value = false
}
</script>

<template>
  <div class="root" ref="rootRef">
    <button
      aria-haspopup="true"
      :aria-controls="props.menuId"
      :aria-expanded="menuIsShowing"
      class="menu-toggle"
      @click="menuIsShowing = !menuIsShowing"
    >
      <FontAwesomeIcon icon="fa-solid fa-ellipsis-vertical" :title="SHARED_COPY.MENU.TOGGLE_MENU" />
    </button>

    <ul v-if="menuIsShowing" class="menu" :id="props.menuId" role="menu">
      <li v-for="action in props.actions" :key="action.text" role="presentation">
        <button class="menu-item" role="menuitem" @click="handleClick(action.onClick)">
          {{ action.text }}
        </button>
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
}

.menu-toggle {
  --button-size: 3rem;

  align-self: flex-end;
  background: none;
  border-color: transparent;
  border-style: solid;
  border-width: pxToRem(1);
  border-radius: 100%;
  color: var(--color-text);
  display: grid;
  place-items: center center;
  padding: 1rem;
  height: var(--button-size);
  width: var(--button-size);

  &:hover,
  &:active,
  &:focus {
    border-color: var(--color-card-border);
  }
}

.menu {
  border: 1px solid var(--color-card-border);
  border-radius: pxToRem(4);
  font-size: var(--font-size-sm);
  min-width: 5rem;
  overflow: hidden;
  position: absolute;
  transform: translate(-0.5rem, 3.25rem);
  z-index: var(--z-index-toggle-menu);
}

.menu-item {
  background-color: var(--color-site-bg);
  border: none;
  color: var(--color-text);
  padding: var(--space-xs);
  width: 100%;

  &:hover,
  &:focus {
    background-color: var(--color-bg-dim);
  }
}
</style>
