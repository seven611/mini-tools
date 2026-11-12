import { afterEach, describe, expect, it, vi } from 'vitest'
import { useCopy } from '@/composables/use-copy'

describe('useCopy', () => {
  afterEach(() => {
    delete (globalThis as any).uni
  })

  it('copies and toasts on success', async () => {
    const showToast = vi.fn()
    ;(globalThis as any).uni = {
      setClipboardData: ({ success }: any) => success(),
      showToast,
    }
    await useCopy().copy('hello')
    expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ title: '已复制' }))
  })

  it('ignores empty text', async () => {
    const setClipboardData = vi.fn()
    ;(globalThis as any).uni = { setClipboardData, showToast: vi.fn() }
    await useCopy().copy('')
    expect(setClipboardData).not.toHaveBeenCalled()
  })

  it('toasts failure without throwing', async () => {
    const showToast = vi.fn()
    ;(globalThis as any).uni = {
      setClipboardData: ({ fail }: any) => fail(new Error('denied')),
      showToast,
    }
    await useCopy().copy('x')
    expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ title: '复制失败' }))
  })
})