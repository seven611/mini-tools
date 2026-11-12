import { describe, expect, it, vi } from 'vitest'
import { useDebounceFn } from '@/composables/use-debounce'

describe('useDebounceFn', () => {
  it('coalesces rapid calls into the last one', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = useDebounceFn(fn, 300)
    debounced('a')
    debounced('b')
    debounced('c')
    vi.advanceTimersByTime(299)
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('c')
    vi.useRealTimers()
  })
})