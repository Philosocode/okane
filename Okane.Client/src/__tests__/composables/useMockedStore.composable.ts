// External
import type { Mock } from 'vitest'
import type { Store, StoreDefinition } from 'pinia'

/**
 * @param useStore
 * @see https://pinia.vuejs.org/cookbook/testing.html#Mocking-the-returned-value-of-an-action
 */
export function useMockedStore<TStoreDef extends () => unknown>(
  useStore: TStoreDef,
): TStoreDef extends StoreDefinition<infer Id, infer State, infer Getters, infer Actions>
  ? Store<
      Id,
      State,
      Getters,
      {
        [K in keyof Actions]: Actions[K] extends (...args: infer Args) => infer ReturnT
          ? // 👇 depends on your testing framework
            Mock<Args, ReturnT>
          : Actions[K]
      }
    >
  : ReturnType<TStoreDef> {
  return useStore() as any
}
