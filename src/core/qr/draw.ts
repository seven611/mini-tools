/*
 * Original for 随手口袋工具 (GPL-3.0).
 * QR 位矩阵 → canvas 绘制纯计算（取整边缘避免格缝），不依赖任何平台 canvas 实现。
 */

import type { QrMatrix } from './matrix'

export interface QrCanvasContext {
  fillStyle: string
  fillRect(x: number, y: number, w: number, h: number): void
}

export interface QrDrawOptions {
  foreground?: string
  background?: string
  quietZone?: number
}

export function drawQrMatrix(
  ctx: QrCanvasContext,
  matrix: QrMatrix,
  sizePx: number,
  options: QrDrawOptions = {},
): void {
  const quiet = options.quietZone ?? 4
  const total = matrix.size + quiet * 2
  const cell = sizePx / total

  ctx.fillStyle = options.background ?? '#ffffff'
  ctx.fillRect(0, 0, sizePx, sizePx)

  ctx.fillStyle = options.foreground ?? '#000000'
  for (let row = 0; row < matrix.size; row++) {
    for (let col = 0; col < matrix.size; col++) {
      if (!matrix.modules[row][col]) {
        continue
      }
      const x0 = Math.round((col + quiet) * cell)
      const y0 = Math.round((row + quiet) * cell)
      const x1 = Math.round((col + quiet + 1) * cell)
      const y1 = Math.round((row + quiet + 1) * cell)
      ctx.fillRect(x0, y0, x1 - x0, y1 - y0)
    }
  }
}