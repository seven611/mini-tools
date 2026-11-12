import { afterEach, describe, expect, it, vi } from 'vitest'
import { showRewardedVideo } from '@/adapters/ad'
import { ADS } from '@/config/ads'

function mockRewardedAd(isEnded: boolean) {
  const closeHandlers: ((res: { isEnded: boolean }) => void)[] = []
  const ad = {
    onClose: (fn: any) => closeHandlers.push(fn),
    offClose: (fn: any) => closeHandlers.splice(closeHandlers.indexOf(fn), 1),
    onError: vi.fn(),
    offError: vi.fn(),
    load: vi.fn(() => Promise.resolve()),
    show: vi.fn(() => {
      setTimeout(() => closeHandlers.forEach(fn => fn({ isEnded })), 0)
      return Promise.resolve()
    }),
  }
  ;(globalThis as any).wx = { createRewardedVideoAd: () => ad }
  return ad
}

describe('rewarded video adapter', () => {
  afterEach(() => {
    ADS.enabled = false
    ADS.rewardedVideoUnitId = ''
    delete (globalThis as any).wx
  })

  it('resolves false without touching wx while ads are disabled', async () => {
    const create = vi.fn()
    ;(globalThis as any).wx = { createRewardedVideoAd: create }
    await expect(showRewardedVideo()).resolves.toBe(false)
    expect(create).not.toHaveBeenCalled()
  })

  it('resolves true only when the video was watched to the end', async () => {
    ADS.enabled = true
    ADS.rewardedVideoUnitId = 'test-unit'
    mockRewardedAd(true)
    await expect(showRewardedVideo()).resolves.toBe(true)
  })

  it('resolves false when the user closes early', async () => {
    ADS.enabled = true
    ADS.rewardedVideoUnitId = 'test-unit'
    mockRewardedAd(false)
    await expect(showRewardedVideo()).resolves.toBe(false)
  })
})