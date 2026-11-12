/*
 * Original for 随手口袋工具 (GPL-3.0). 平台适配层：广告。
 * 流量主达标前 ADS.enabled=false，所有入口静默返回，不阻断任何核心功能。
 * 激励视频仅在用户主动触发增值功能时调用；未看完（isEnded=false）不加次。
 */

import { ADS } from '@/config/ads'
import { todayKey } from '@/core/quota/quota'
import { readStorage, writeStorage } from '@/adapters/storage'

export function showRewardedVideo(): Promise<boolean> {
  if (!ADS.enabled || !ADS.rewardedVideoUnitId) {
    return Promise.resolve(false)
  }
  // #ifdef MP-WEIXIN
  return new Promise((resolve) => {
    const ad = wx.createRewardedVideoAd({ adUnitId: ADS.rewardedVideoUnitId })
    const onClose = (res: { isEnded?: boolean }) => {
      cleanup()
      resolve(Boolean(res && res.isEnded))
    }
    const onError = () => {
      cleanup()
      resolve(false)
    }
    const cleanup = () => {
      ad.offClose(onClose)
      ad.offError(onError)
    }
    ad.onClose(onClose)
    ad.onError(onError)
    ad.show().catch(() => {
      ad.load()
        .then(() => ad.show())
        .catch(() => {
          cleanup()
          resolve(false)
        })
    })
  })
  // #endif
  // #ifndef MP-WEIXIN
  return Promise.resolve(false)
  // #endif
}

const INTERSTITIAL_KEY = 'ittools:interstitial'
const INTERSTITIAL_MIN_GAP_MS = 30_000
const INTERSTITIAL_DAILY_MAX = 3

export function maybeShowInterstitial(): void {
  if (!ADS.enabled || !ADS.interstitialUnitId) {
    return
  }
  // #ifdef MP-WEIXIN
  const today = todayKey()
  const now = Date.now()
  const saved = readStorage<{ date: string; count: number; last: number }>(
    INTERSTITIAL_KEY,
    { date: today, count: 0, last: 0 },
  )
  const record = saved.date === today ? saved : { date: today, count: 0, last: 0 }
  if (record.count >= INTERSTITIAL_DAILY_MAX || now - record.last < INTERSTITIAL_MIN_GAP_MS) {
    return
  }
  writeStorage(INTERSTITIAL_KEY, { date: today, count: record.count + 1, last: now })
  const ad = wx.createInterstitialAd({ adUnitId: ADS.interstitialUnitId })
  ad.show().catch(() => {})
  // #endif
}