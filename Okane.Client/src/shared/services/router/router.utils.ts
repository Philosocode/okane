// External
import type { RouteLocationNamedRaw, Router } from 'vue-router'

// Internal
import type { RouteName } from 'src/shared/services/router/router.service'

export function getURLByRouteName(
  router: Router,
  routeName: RouteName,
  options?: RouteLocationNamedRaw,
) {
  return router.resolve({ name: routeName, ...options }).fullPath
}
