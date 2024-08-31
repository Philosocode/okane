<script setup lang="ts">
// External
import { computed, inject } from 'vue'

// Internal
import Modal from '@shared/components/modal/Modal.vue'
import ModalActions from '@shared/components/modal/ModalActions.vue'
import ModalHeading from '@shared/components/modal/ModalHeading.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { FINANCE_RECORD_QUERY_KEYS } from '@features/financeRecords/constants/queryKeys'
import { SHARED_COPY } from '@shared/constants/copy'
import {
  DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
  FINANCE_RECORD_SEARCH_FILTERS_KEY,
} from '@features/financeRecords/constants/searchFilters'

import { useDeleteFinanceRecordMutation } from '@features/financeRecords/composables/useDeleteFinanceRecordMutation'

type Props = {
  financeRecordId?: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (event: 'close'): void
}>()

const id = computed(() => props.financeRecordId ?? -1)
const searchFilters = inject(FINANCE_RECORD_SEARCH_FILTERS_KEY)
const queryKey = computed(() =>
  FINANCE_RECORD_QUERY_KEYS.LIST_BY_FILTERS(
    searchFilters?.value ?? DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
  ),
)

const { mutate: deleteFinanceRecord } = useDeleteFinanceRecordMutation(id, queryKey)

function closeModal() {
  emit('close')
}

function handleDelete() {
  deleteFinanceRecord(undefined, {
    onSuccess() {
      console.log('made it')
      closeModal()
    },
  })
}
</script>

<template>
  <Modal :is-showing="Boolean(financeRecordId)" @close="closeModal">
    <ModalHeading>{{
      FINANCES_COPY.DELETE_FINANCE_RECORD_MODAL.DELETE_FINANCE_RECORD
    }}</ModalHeading>

    <p class="confirmation">{{ FINANCES_COPY.DELETE_FINANCE_RECORD_MODAL.ARE_YOU_SURE }}</p>

    <ModalActions>
      <button @click="handleDelete">{{ SHARED_COPY.ACTIONS.DELETE }}</button>
      <button @click="closeModal">{{ SHARED_COPY.ACTIONS.CANCEL }}</button>
    </ModalActions>
  </Modal>
</template>
