import { afterEach, describe, expect, it } from 'vitest'
import { getRandomBytes } from '@/adapters/random'

describe('random adapter (wx.getRandomValues on MP-WEIXIN)', () => {
  afterEach(() => {
    delete (globalThis as any).wx
  })

  it('resolves with the requested number of bytes', async () => {
    ;(globalThis as any).wx = {
      getRandomValues: ({ length }: { length: number }) =>
        Promise.resolve({ randomValues: new ArrayBuffer(length) }),
    }
    const bytes = await getRandomBytes(16)
    expect(bytes).toBeInstanceOf(Uint8Array)
    expect(bytes.length).toBe(16)
  })

  it('rejects when the platform call fails', async () => {
    ;(globalThis as any).wx = {
      getRandomValues: () => Promise.reject(new Error('fail')),
    }
    await expect(getRandomBytes(8)).rejects.toThrow('fail')
  })
})