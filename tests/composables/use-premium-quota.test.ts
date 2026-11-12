import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePremiumQuota } from '@/composables/use-premium-quota'

describe('usePremiumQuota (daily free + rewarded video top-up)', () => {
  let store: Record<string, unknown>

  beforeEach(() => {
    store = {}
    ;(globalThis as any).uni = {
      getStorageSync: (key: string) => store[key] ?? '',
      setStorageSync: (key: string, value: unknown) => {
        store[key] = value
      },
    }
  })

  it('grants the first use free without showing an ad', async () => {
    const showAd = vi.fn()
    const { requestUse, left } = usePremiumQuota('qr-hd', showAd)
    await expect(requestUse()).resolves.toBe('free')
    expect(showAd).not.toHaveBeenCalled()
    expect(left.value).toEqual({ free: 0, ad: 0 })
  })

  it('shows an ad on the second use and grants one use when watched', async () => {
    const showAd = vi.fn(() => Promise.resolve(true))
    const { requestUse } = usePremiumQuota('qr-hd', showAd)
    await requestUse()
    await expect(requestUse()).resolves.toBe('ad')
    expect(showAd).toHaveBeenCalledTimes(1)
  })

  it('does not grant when the ad is not watched to the end', async () => {
    const showAd = vi.fn(() => Promise.resolve(false))
    const { requestUse, left } = usePremiumQuota('qr-hd', showAd)
    await requestUse()
    await expect(requestUse()).resolves.toBe('none')
    expect(left.value).toEqual({ free: 0, ad: 0 })
  })

  it('persists quota across sessions', async () => {
    const showAd = vi.fn(() => Promise.resolve(true))
    const first = usePremiumQuota('qr-hd', showAd)
    await first.requestUse()
    await first.requestUse()

    const second = usePremiumQuota('qr-hd', vi.fn(() => Promise.resolve(false)))
    await expect(second.requestUse()).resolves.toBe('none')
  })
})