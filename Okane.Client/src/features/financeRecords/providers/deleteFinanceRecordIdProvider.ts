// External
import { ref, type InjectionKey } from 'vue'

export type DeleteFinanceRecordIdProvider = ReturnType<typeof useDeleteFinanceRecordId>

export const DELETE_FINANCE_RECORD_ID_SYMBOL =
  Symbol() as InjectionKey<DeleteFinanceRecordIdProvider>

export function useDeleteFinanceRecordId() {
  const id = ref<number | undefined>()

  function setId(nextId?: number) {
    id.value = nextId
  }

  return {
    get id() {
      return id.value
    },
    setId,
  }
}
