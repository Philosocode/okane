<script setup lang="ts">
// External
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { onClickOutside } from '@vueuse/core'
import { useTemplateRef } from 'vue'

// Internal
import { SHARED_COPY } from '@shared/constants/copy'
import { TEST_IDS } from '@shared/constants/testIds'

// Internal
type Props = {
  isShowing: boolean
  modalHeadingId: string
}

const props = defineProps<Props>()

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
        ref="dialogRef"
        :data-testid="TEST_IDS.MODAL"
        v-bind="$attrs"
        @close="emitModalClose"
      >
        <div class="modal-content">
          <button class="close-button" @click="emitModalClose">
            <FontAwesomeIcon icon="fa-solid fa-xmark" :title="SHARED_COPY.MODAL.CLOSE_MODAL" />
          </button>
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.backdrop {
  background-color: rgba(0, 0, 0, 35%);
  position: fixed;
  bottom: 0;
  left: 0;
  top: 0;
  right: 0;
  z-index: var(--z-index-modal);
}

.close-button {
  border: none;
  border-radius: 100%;

  height: 2rem;
  width: 2rem;

  position: absolute;
  right: 0.25rem;
  top: 0.25rem;
}

.modal {
  background-color: var(--color-gray-50);
  border: none;
  border-radius: 0.5rem;
  color: var(--color-gray-900);
  padding: 0;

  height: 100%;
  max-height: 100%;
  width: 100%;
  max-width: 100%;

  @include respond(sm) {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    height: max-content;
    max-width: pxToRem(400);
  }
}

.modal-content {
  padding: 1rem;

  & > * + * {
    margin-top: var(--space-sm);
  }
}
</style>
