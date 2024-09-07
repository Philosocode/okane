// External
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useMutation, useQueryClient, type QueryKey } from '@tanstack/vue-query'

// Internal
import { financeRecordAPIRoutes } from '@features/financeRecords/constants/apiRoutes'

import { type FinanceRecord } from '@features/financeRecords/types/financeRecord'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { getInitialSaveFinanceRecordFormState } from '@features/financeRecords/utils/saveFinanceRecord'
import { mapFinanceRecord } from '@features/financeRecords/utils/mappers'

function patchFinanceRecord(id: number, changes: Partial<FinanceRecord>) {
  return apiClient.patch(financeRecordAPIRoutes.patchFinanceRecord.buildPath({ id }), changes)
}

export function useEditFinanceRecord(
  financeRecord: MaybeRefOrGetter<FinanceRecord | undefined>,
  queryKey: MaybeRefOrGetter<QueryKey>,
) {
  const editFormState = computed(() => {
    const maybeFinanceRecord = toValue(financeRecord)
    if (!maybeFinanceRecord) return getInitialSaveFinanceRecordFormState()

    return mapFinanceRecord.to.saveFinanceRecordFormState(maybeFinanceRecord)
  })

  const queryClient = useQueryClient()

  const editMutation = useMutation({
    mutationFn: async (changes: Partial<FinanceRecord>) => {
      const id = toValue(financeRecord)?.id
      if (id) return patchFinanceRecord(id, changes)
    },
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: toValue(queryKey) })
    },
  })

  return {
    editFormState,
    editMutation,
  }
}
