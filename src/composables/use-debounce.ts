/*
 * Original for 随手口袋工具 (GPL-3.0). 手写防抖，替代上游 @vueuse/useDebounceFn。
 */

export function useDebounceFn<T extends (...args: any[]) => void>(fn: T, wait = 300) {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => fn(...args), wait)
  }
}