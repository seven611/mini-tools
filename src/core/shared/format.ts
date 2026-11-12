/*
 * Original for 随手口袋工具 (GPL-3.0). 数字展示与输入解析的共享纯函数。
 */

export function formatNumber(value: number | null, decimals = 6): string {
  if (value == null || !Number.isFinite(value)) {
    return ''
  }
  return String(parseFloat(value.toFixed(decimals)))
}

export function parseNumber(text: string): number | null {
  const trimmed = text.trim()
  if (!trimmed) {
    return null
  }
  const value = Number(trimmed)
  return Number.isFinite(value) ? value : null
}