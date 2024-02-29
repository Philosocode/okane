// See: https://router.vuejs.org/guide/advanced/meta.html#TypeScript
import 'vue-router'

// To ensure it is treated as a module, add at least one `export` statement
export {}

declare module 'vue-router' {
  interface RouteMeta {
    // If the route can be accessed without logging in.
    isPublic?: boolea
  }
}
