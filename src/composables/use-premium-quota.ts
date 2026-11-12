/*
 * Original for 随手口袋工具 (GPL-3.0).
 * 增值功能额度 composable：每日免费 1 次，超出看激励视频加 1 次；
 * 未看完不扣次、不阻断；核心功能不经过此模块。
 */

import { computed, ref } from 'vue'
import { consume, grantByAd, remaining, todayKey, type QuotaState } from '@/core/quota/quota'
import { readStorage, writeStorage } from '@/adapters/storage'
import { showRewardedVideo } from '@/adapters/ad'

const KEY = 'ittools:quota'

export function usePremiumQuota(
  featureId: string,
  showAd: () => Promise<boolean> = showRewardedVideo,
) {
  const state = ref<QuotaState>(readStorage<QuotaState>(KEY, {}))
  const left = computed(() => remaining(state.value, featureId, todayKey()))

  function persist(next: QuotaState) {
    state.value = next
    writeStorage(KEY, next)
  }

  async function requestUse(): Promise<'free' | 'ad' | 'none'> {
    const first = consume(state.value, featureId, todayKey())
    if (first.source !== 'none') {
      persist(first.state)
      return first.source
    }
    const watched = await showAd()
    if (!watched) {
      return 'none'
    }
    persist(grantByAd(state.value, featureId, todayKey()))
    const second = consume(state.value, featureId, todayKey())
    persist(second.state)
    return second.source
  }

  return { left, requestUse }
}