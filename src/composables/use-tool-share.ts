/*
 * Original for 随手口袋工具 (GPL-3.0). 每工具页定制分享卡片（不做诱导分享）。
 */

import { onShareAppMessage } from '@dcloudio/uni-app'
import { getTool } from '@/tools-registry'

export function useToolShare(id: string) {
  const tool = getTool(id)
  onShareAppMessage(() => ({
    title: tool ? `${tool.name}｜随手口袋工具` : '随手口袋工具',
    path: tool ? `${tool.pagePath}?from=share` : '/pages/index/index',
    imageUrl: '/static/share-cover.jpg',
  }))
}