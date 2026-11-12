/*
 * Original for 随手口袋工具 (GPL-3.0).
 * 增值功能每日额度：每项功能每日免费 1 次，超出靠激励视频加次。
 * 纯函数 + 不可变状态，跨自然日自动重置；核心功能不经过此模块（永久免费）。
 */

export interface QuotaEntry {
  date: string
  freeUsed: number
  adGranted: number
}

export type QuotaState = Record<string, QuotaEntry>

export type ConsumeSource = 'free' | 'ad' | 'none'

export function todayKey(now: Date = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

function entryFor(state: QuotaState, featureId: string, today: string): QuotaEntry {
  const entry = state[featureId]
  if (!entry || entry.date !== today) {
    return { date: today, freeUsed: 0, adGranted: 0 }
  }
  return entry
}

export function consume(
  state: QuotaState,
  featureId: string,
  today: string,
): { state: QuotaState; source: ConsumeSource } {
  const entry = entryFor(state, featureId, today)
  if (entry.freeUsed < 1) {
    return {
      state: { ...state, [featureId]: { ...entry, freeUsed: entry.freeUsed + 1 } },
      source: 'free',
    }
  }
  if (entry.adGranted > 0) {
    return {
      state: { ...state, [featureId]: { ...entry, adGranted: entry.adGranted - 1 } },
      source: 'ad',
    }
  }
  return { state, source: 'none' }
}

export function grantByAd(state: QuotaState, featureId: string, today: string): QuotaState {
  const entry = entryFor(state, featureId, today)
  return { ...state, [featureId]: { ...entry, adGranted: entry.adGranted + 1 } }
}

export function remaining(state: QuotaState, featureId: string, today: string): { free: number; ad: number } {
  const entry = entryFor(state, featureId, today)
  return { free: Math.max(0, 1 - entry.freeUsed), ad: entry.adGranted }
}