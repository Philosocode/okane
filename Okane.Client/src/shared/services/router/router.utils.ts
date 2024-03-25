// External
import type { RouteLocationNamedRaw } from 'vue-router'

// Internal
import { ROUTE_NAME } from '@/shared/services/router/router.constants'

import { router } from '@/shared/services/router/router.service'

export function getURLByRouteName(routeName: ROUTE_NAME, options?: RouteLocationNamedRaw) {
  return router.resolve({ name: routeName, ...options }).fullPath
}
