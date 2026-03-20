export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastArgs: Parameters<T> | null = null
  let lastThis: ThisType<T> | null = null

  return function (this: ThisType<T>, ...args: Parameters<T>) {
    lastArgs = args
    lastThis = this

    if (!timeoutId) {
      timeoutId = setTimeout(() => {
        func.apply(lastThis, lastArgs!)
        timeoutId = null
        lastArgs = null
        lastThis = null
      }, delay)
    }
  }
}
