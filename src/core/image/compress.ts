/*
 * Original for 随手口袋工具 (GPL-3.0). 图片压缩纯逻辑：目标尺寸/字节格式化/节省比例。
 */

export interface ImageSize {
  width: number
  height: number
}

export function targetSize(width: number, height: number, maxEdge: number): ImageSize {
  const long = Math.max(width, height)
  if (!maxEdge || maxEdge <= 0 || maxEdge >= long) return { width, height }
  const scale = maxEdge / long
  return { width: Math.round(width * scale), height: Math.round(height * scale) }
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let i = 0
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024
    i++
  }
  const text = i === 0 ? String(Math.round(value)) : String(parseFloat(value.toFixed(1)))
  return `${text} ${units[i]}`
}

export function savingsPercent(original: number, compressed: number): number {
  if (!original || original <= 0) return 0
  return Math.max(0, Math.round((1 - compressed / original) * 100))
}