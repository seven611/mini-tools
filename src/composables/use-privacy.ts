/*
 * Original for 随手口袋工具 (GPL-3.0).
 * 隐私弹窗全局单例：wx.onNeedPrivacyAuthorization 只注册一次，
 * 避免多页面重复注册导致返回旧页面后弹窗失效。
 */

import { ref } from 'vue'

const visible = ref(false)
let resolver: ((res: { event: 'agree' | 'disagree' }) => void) | null = null

// #ifdef MP-WEIXIN
if (typeof wx !== 'undefined' && wx.onNeedPrivacyAuthorization) {
  wx.onNeedPrivacyAuthorization((resolve) => {
    resolver = resolve as unknown as typeof resolver
    visible.value = true
  })
}
// #endif

export function usePrivacy() {
  function agree() {
    resolver?.({ event: 'agree' })
    resolver = null
    visible.value = false
  }
  function disagree() {
    resolver?.({ event: 'disagree' })
    resolver = null
    visible.value = false
  }
  return { visible, agree, disagree }
}