type Args = {
  isIntersecting: boolean

  disconnect?: IntersectionObserver['disconnect']
}

// Referenced: https://stackoverflow.com/a/70293150
export function setUpIntersectionObserverMock(args: Args) {
  return class IntersectionObserverMock implements IntersectionObserver {
    readonly root: Element | null = null
    readonly rootMargin: string = ''
    readonly thresholds: ReadonlyArray<number> = []

    disconnect: () => void = args.disconnect ?? vi.fn()
    observe: (target: Element) => void = vi.fn()
    takeRecords: () => IntersectionObserverEntry[] = () => [
      {
        boundingClientRect: {} as DOMRectReadOnly,
        intersectionRatio: 1,
        intersectionRect: {} as DOMRectReadOnly,
        isIntersecting: args.isIntersecting,
        rootBounds: null,
        target: {} as Element,
        time: 1,
      },
    ]
    unobserve: (target: Element) => void = vi.fn()

    constructor(
      callback: (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => void,
    ) {
      callback(this.takeRecords(), this)
    }
  }
}
