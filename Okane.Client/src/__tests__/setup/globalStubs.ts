// External
import { config } from '@vue/test-utils'

config.global.stubs = {
  UseFocusTrap: {
    props: ['options'],
    template: '<slot />',
  },
}
