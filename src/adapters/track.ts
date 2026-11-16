/*
 * Original for 随手口袋工具 (GPL-3.0). 埋点适配层。
 * 仅通过微信官方统计（We分析/数据助手）上报匿名使用事件（工具 id 等），
 * 不含个人信息、不上传任何输入内容；H5 无 wx 时自动 no-op。
 * 事件需在 mp 后台「We分析/自定义分析」配置后方可在报表查看。
 */

export type TrackData = Record<string, string | number>

export function trackEvent(event: string, data: TrackData = {}): void {
  const w = (globalThis as any).wx
  if (!w) return
  if (typeof w.reportEvent === 'function') {
    w.reportEvent(event, data)
  }
  else if (typeof w.reportAnalytics === 'function') {
    w.reportAnalytics(event, data)
  }
}

export function trackToolUse(toolId: string): void {
  trackEvent('tool_use', { tool_id: toolId })
}