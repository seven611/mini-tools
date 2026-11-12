import { afterEach, describe, expect, it, vi } from 'vitest'
import { copyText } from '@/adapters/clipboard'

describe('clipboard adapter (user-initiated copy only)', () => {
  afterEach(() => {
    delete (globalThis as any).uni
  })

  it('calls uni.setClipboardData with the text and resolves on success', async () => {
    const setClipboardData = vi.fn(({ success }: any) => success())
    ;(globalThis as any).uni = { setClipboardData }
    await copyText('hello')
    expect(setClipboardData).toHaveBeenCalledWith(expect.objectContaining({ data: 'hello' }))
  })

  it('rejects on failure', async () => {
    ;(globalThis as any).uni = {
      setClipboardData: ({ fail }: any) => fail(new Error('denied')),
    }
    await expect(copyText('x')).rejects.toThrow('denied')
  })
})