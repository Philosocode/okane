// External
import { defineComponent } from 'vue'
import { flushPromises } from '@vue/test-utils'

// Internal
import { financeUserTagApiRoutes } from '@features/financeUserTags/constants/apiRoutes'
import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'

import { useQueryFinanceUserTags } from '@features/financeUserTags/composables/useQueryFinanceUserTags'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { wrapInApiResponse } from '@tests/utils/apiResponse'

function getTestComponent() {
  return defineComponent({
    setup() {
      const { data: userTagMap, isLoading } = useQueryFinanceUserTags()
      return { isLoading, userTagMap }
    },
    template: `
      <div v-if="!isLoading">
        <div data-type="Expense" v-for="userTag in userTagMap['${FINANCE_RECORD_TYPE.EXPENSE}']">
          {{ userTag.tag.name }}
        </div>
        <div data-type="Revenue" v-for="userTag in userTagMap['${FINANCE_RECORD_TYPE.REVENUE}']">
          {{ userTag.tag.name }}
        </div>
      </div>
    `,
  })
}

const mountComponent = getMountComponent(getTestComponent(), { withQueryClient: true })

const returnedUserTags = [
  { tag: { name: 'e1' }, type: FINANCE_RECORD_TYPE.EXPENSE },
  { tag: { name: 'e2' }, type: FINANCE_RECORD_TYPE.EXPENSE },
  { tag: { name: 'r1' }, type: FINANCE_RECORD_TYPE.REVENUE },
  { tag: { name: 'r2' }, type: FINANCE_RECORD_TYPE.REVENUE },
]

test('makes a request to fetch all finance user tags', async () => {
  const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue(wrapInApiResponse(returnedUserTags))
  const wrapper = mountComponent()

  expect(getSpy).toHaveBeenCalledWith(financeUserTagApiRoutes.getAll(), {
    signal: new AbortController().signal,
  })

  await flushPromises()

  const expenseTags = wrapper.findAll(`[data-type="${FINANCE_RECORD_TYPE.EXPENSE}"]`)
  expect(expenseTags).toHaveLength(2)
  expect(expenseTags[0].text()).toBe(returnedUserTags[0].tag.name)
  expect(expenseTags[1].text()).toBe(returnedUserTags[1].tag.name)

  const revenueTags = wrapper.findAll(`[data-type="${FINANCE_RECORD_TYPE.REVENUE}"]`)
  expect(revenueTags).toHaveLength(2)
  expect(revenueTags[0].text()).toBe(returnedUserTags[2].tag.name)
  expect(revenueTags[1].text()).toBe(returnedUserTags[3].tag.name)
})
