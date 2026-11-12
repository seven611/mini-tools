/*
 * Original for 随手口袋工具 (GPL-3.0). 用户主动复制 + 轻提示。
 */

import { copyText } from '@/adapters/clipboard'

export function useCopy() {
  async function copy(text: string, label = '已复制') {
    if (!text) {
      return
    }
    try {
      await copyText(text)
      uni.showToast({ title: label, icon: 'none' })
    }
    catch {
      uni.showToast({ title: '复制失败', icon: 'none' })
    }
  }
  return { copy }
}