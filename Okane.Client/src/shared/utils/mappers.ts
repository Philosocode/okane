// Internal
import type { AnyFunction } from '@shared/types/shared'

type Mappers = {
  [key: string]: AnyFunction
}

export function createMappers<T extends Mappers>(mappers: T) {
  return {
    to: mappers,
  }
}
