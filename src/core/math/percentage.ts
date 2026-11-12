/*
 * Ported from it-tools (https://github.com/CorentinTh/it-tools), Copyright Corentin Thomasset, GPL-3.0.
 * Modified for 随手口袋工具: 从 Vue 组件内联计算提取为纯函数；非法结果返回 null。详见 UPSTREAM.md。
 */

export function percentOf(x: number, y: number): number {
  return (x / 100) * y
}

export function whatPercent(x: number, y: number): number | null {
  const result = (100 * x) / y
  return Number.isFinite(result) ? result : null
}

export function percentChange(from: number, to: number): number | null {
  const result = ((to - from) / from) * 100
  return Number.isFinite(result) ? result : null
}