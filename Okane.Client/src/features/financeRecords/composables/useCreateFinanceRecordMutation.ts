// External
import { type QueryKey, useMutation, useQueryClient } from '@tanstack/vue-query'

import { ref, type Ref } from 'vue'

// Internal
import { financeRecordAPIRoutes } from '@features/financeRecords/constants/apiRoutes'
import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'

import type {
  PreCreationFinanceRecord,
  SaveFinanceRecordFormState,
} from '@features/financeRecords/types/saveFinanceRecord'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { dateToDateTimeLocalFormat } from '@shared/utils/dateTime'
import { mapSaveFinanceRecordFormStateToPreCreationFinanceRecord } from '@features/financeRecords/utils/mappers'

function postFinanceRecord(financeRecord: PreCreationFinanceRecord) {
  return apiClient.post(financeRecordAPIRoutes.postFinanceRecord.buildPath(), financeRecord)
}

export function useCreateFinanceRecordMutation(queryKey: Ref<QueryKey>) {
  const createFormState = ref<SaveFinanceRecordFormState>({
    amount: 0,
    description: '',
    happenedAt: dateToDateTimeLocalFormat(new Date(Date.now())),
    type: FINANCE_RECORD_TYPE.EXPENSE,
  })

  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: postFinanceRecord,
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: queryKey.value })
    },
  })

  function createFinanceRecord(formState: SaveFinanceRecordFormState) {
    const financeRecord = mapSaveFinanceRecordFormStateToPreCreationFinanceRecord(formState)

    createMutation.mutate(financeRecord, {
      onSuccess() {
        createFormState.value = {
          ...createFormState.value,
          amount: 0,
          description: '',
        }
      },
      onError(err) {
        // TODO: Return an error message.
        console.error('Error creating finance record.', err)
      },
    })
  }

  return {
    createFormState,
    createFinanceRecord,
  }
}
