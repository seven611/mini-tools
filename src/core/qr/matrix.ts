/*
 * Original for 随手口袋工具 (GPL-3.0).
 * 只用 qrcode 的纯计算核心 create() 取位矩阵，供小程序 canvas 2d 手动绘制。
 * 注意：必须引 qrcode/lib/core/qrcode（纯逻辑、零平台依赖）。
 * 主入口 qrcode 走 Node server build（pngjs/fs），小程序端 create 会抛错。
 */

import QRCode from 'qrcode/lib/core/qrcode'

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

export interface QrMatrix {
  size: number
  modules: boolean[][]
}

export function createQrMatrix(text: string, errorCorrectionLevel: ErrorCorrectionLevel = 'M'): QrMatrix | null {
  const value = text.trim()
  if (!value) {
    return null
  }

  const { modules } = QRCode.create(value, { errorCorrectionLevel })
  const size = modules.size
  const data = modules.data

  const rows: boolean[][] = []
  for (let row = 0; row < size; row++) {
    const cells: boolean[] = []
    for (let col = 0; col < size; col++) {
      cells.push(Boolean(data[row * size + col]))
    }
    rows.push(cells)
  }
  return { size, modules: rows }
}