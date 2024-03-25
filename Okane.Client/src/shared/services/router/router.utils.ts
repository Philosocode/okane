// External
import type { RouteLocationNamedRaw } from 'vue-router'

// Internal
import type { RouteName } from '@/shared/services/router/router.service'
import { router } from '@/shared/services/router/router.service'

export function getURLByRouteName(routeName: RouteName, options?: RouteLocationNamedRaw) {
  return router.resolve({ name: routeName, ...options }).fullPath
}
