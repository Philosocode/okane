<script setup lang="ts">
// External
import { useTemplateRef } from 'vue'
import { onClickOutside, onKeyStroke } from '@vueuse/core'

// Internal
import Card from '@shared/components/wrappers/Card.vue'
import IconButton from '@shared/components/IconButton.vue'
import ModalHeading from '@shared/components/modal/ModalHeading.vue'

import { SHARED_COPY } from '@shared/constants/copy'
import { TEST_IDS } from '@shared/constants/testIds'

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
const dialogRef = useTemplateRef<HTMLDialogElement>('dialogRef')

function emitModalClose() {
  emit('close')
}

onClickOutside(dialogRef, (event) => {
  if (event.target === backdropRef.value) emitModalClose()
})

onKeyStroke('Escape', () => {
  emitModalClose()
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
      <Card
        aria-modal="true"
        :aria-labelledby="props.modalHeadingId"
        class="modal"
        :data-disable-document-scroll="props.isShowing"
        ref="dialogRef"
        :data-testid="TEST_IDS.MODAL"
        v-bind="$attrs"
        @close="emitModalClose"
      >
        <div class="modal-content">
          <div class="top-row">
            <ModalHeading :id="props.modalHeadingId">{{ props.headingText }}</ModalHeading>
            <IconButton
              class="close-button"
              icon="fa-solid fa-xmark"
              :title="SHARED_COPY.MODAL.CLOSE_MODAL"
              @click="emitModalClose"
            />
          </div>

          <slot />
        </div>
      </Card>
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
  border-radius: 0.5rem;
  overflow-y: auto;
  padding: 0;
  position: relative;

  height: 100%;
  max-height: 100%;
  width: 100%;
  max-width: 100%;

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

  & > * + * {
    margin-top: var(--space-md);
  }
}

.top-row {
  align-items: center;
  display: flex;
  justify-content: space-between;
}
</style>
