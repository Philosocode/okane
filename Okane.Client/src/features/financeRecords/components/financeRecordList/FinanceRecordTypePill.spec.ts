// Internal
import Kicker from '@shared/components/typography/Kicker.vue'
import FinanceRecordTypePill, {
  type FinanceRecordTypePillProps,
} from '@features/financeRecords/components/financeRecordList/FinanceRecordTypePill.vue'

import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'

const mountComponent = getMountComponent(FinanceRecordTypePill)

const defaultProps: FinanceRecordTypePillProps = {
  type: FINANCE_RECORD_TYPE.REVENUE,
}

test('renders the type', () => {
  const wrapper = mountComponent({ props: defaultProps })
  const type = wrapper.getComponent(Kicker)
  expect(type.text()).toBe(defaultProps.type)
})
