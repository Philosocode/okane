// See: https://router.vuejs.org/guide/advanced/meta.html#TypeScript
import 'vue-router'

// To ensure it is treated as a module, add at least one `export` statement
export {}

declare module 'vue-router' {
  interface RouteMeta {
    // Can non-authenticated users access this route?
    isPublic?: boolea

    // Can authenticated users access this route?
    isPublicOnly?: boolean
  }
}
