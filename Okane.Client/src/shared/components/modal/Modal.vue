<script setup lang="ts">
// External
import { onClickOutside, onKeyStroke } from '@vueuse/core'
import { useTemplateRef } from 'vue'
import { UseFocusTrap } from '@vueuse/integrations/useFocusTrap/component'

// Internal
import IconButton from '@shared/components/button/IconButton.vue'
import ModalHeading from '@shared/components/modal/ModalHeading.vue'

import { SHARED_COPY } from '@shared/constants/copy'
import { TEST_IDS } from '@shared/constants/testIds'

import { useModalTriggerStore } from '@shared/composables/useModalTriggerStore'

export type ModalProps = {
  headingText: string
  isShowing: boolean
  modalHeadingId: string
}

const props = defineProps<ModalProps>()

const emit = defineEmits<{
  (event: 'close'): void
}>()

const backdropRef = useTemplateRef<HTMLDivElement>('backdropRef')
const modalRef = useTemplateRef<HTMLDivElement>('modalRef')
const triggerStore = useModalTriggerStore()

function refocusTrigger() {
  triggerStore.modalTrigger?.focus()
  triggerStore.setModalTrigger(null)
}

onClickOutside(modalRef, (event) => {
  if (event.target === backdropRef.value) {
    emit('close')
  }
})

onKeyStroke('Escape', () => {
  emit('close')
})
</script>

<template>
  <Teleport to="#modal">
    <div
      v-if="props.isShowing"
      class="backdrop"
      ref="backdropRef"
      :data-testid="TEST_IDS.MODAL_BACKDROP"
    >
      <div
        aria-modal="true"
        :aria-labelledby="props.modalHeadingId"
        class="modal"
        :data-disable-document-scroll="props.isShowing"
        ref="modalRef"
        :data-testid="TEST_IDS.MODAL"
        v-bind="$attrs"
      >
        <UseFocusTrap :options="{ onDeactivate: refocusTrigger }">
          <div class="modal-content flow">
            <div class="top-row">
              <ModalHeading :id="props.modalHeadingId">{{ props.headingText }}</ModalHeading>
              <IconButton
                class="close-button"
                icon="fa-solid fa-xmark"
                :title="SHARED_COPY.MODAL.CLOSE_BUTTON_TITLE"
                @click="emit('close')"
              />
            </div>

            <slot />
          </div>
        </UseFocusTrap>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.backdrop {
  background-color: rgba(0, 0, 0, 60%);
  position: fixed;
  bottom: 0;
  left: 0;
  top: 0;
  right: 0;
  z-index: var(--z-index-modal);
}

.close-button {
  height: 2rem;
  width: 2rem;
  font-size: var(--font-size-lg);
}

.modal {
  background-color: var(--color-site-bg);
  border: none;
  overflow-y: auto;
  padding: 0;
  position: relative;

  height: 100%;
  width: 100%;

  @include respond(sm) {
    border: var(--border-main);
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    height: max-content;
    max-width: pxToRem(450);
  }
}

.modal-content {
  padding: var(--space-md);
}

.top-row {
  align-items: center;
  display: flex;
  justify-content: space-between;
}
</style>
