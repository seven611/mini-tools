/*
 * Original for 随手口袋工具 (GPL-3.0).
 * 小程序 canvas 2d 渲染/导出/保存相册适配：预览用页面 canvas 节点，
 * 导出用离屏 canvas 重绘（标清带水印 / 高清无水印），拒授权引导 openSetting。
 */

import { drawQrMatrix, type QrDrawOptions } from '@/core/qr/draw'
import type { QrMatrix } from '@/core/qr/matrix'

const WATERMARK_TEXT = '随手口袋工具'
const WATERMARK_STRIP = 60

export interface QrExportOptions extends QrDrawOptions {
  size?: number
  watermark?: boolean
}

export function useQrCanvas() {
  function getCanvasNode(selector: string, instance: unknown): Promise<{ node: any; width: number; height: number }> {
    return new Promise((resolve, reject) => {
      uni.createSelectorQuery()
        .in(instance as any)
        .select(selector)
        .fields({ node: true, size: true }, (res: any) => {
          if (res && res.node) {
            resolve(res)
          }
          else {
            reject(new Error('canvas node not found'))
          }
        })
        .exec()
    })
  }

  async function drawPreview(
    canvasId: string,
    matrix: QrMatrix,
    instance: unknown,
    options: QrDrawOptions = {},
  ): Promise<void> {
    const { node: canvas, width, height } = await getCanvasNode(`#${canvasId}`, instance)
    const dpr = uni.getSystemInfoSync().pixelRatio || 2
    const px = Math.min(width, height)
    canvas.width = Math.round(px * dpr)
    canvas.height = Math.round(px * dpr)
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    drawQrMatrix(ctx, matrix, px, options)
  }

  function paintExport(ctx: any, matrix: QrMatrix, options: QrExportOptions): number {
    const size = options.size ?? 1080
    const watermark = options.watermark ?? false
    const height = size + (watermark ? WATERMARK_STRIP : 0)
    drawQrMatrix(ctx, matrix, size, options)
    if (watermark) {
      ctx.fillStyle = options.background ?? '#ffffff'
      ctx.fillRect(0, size, size, WATERMARK_STRIP)
      ctx.fillStyle = '#9aa0a6'
      ctx.font = '28px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(WATERMARK_TEXT, size / 2, size + WATERMARK_STRIP / 2)
    }
    return height
  }

  async function exportPng(matrix: QrMatrix, options: QrExportOptions = {}): Promise<string> {
    // #ifdef MP-WEIXIN
    const size = options.size ?? 1080
    const height = size + (options.watermark ? WATERMARK_STRIP : 0)
    const canvas = wx.createOffscreenCanvas({ type: '2d', width: size, height })
    const ctx = canvas.getContext('2d')
    paintExport(ctx, matrix, options)
    const { tempFilePath } = await wx.canvasToTempFilePath({ canvas })
    return tempFilePath
    // #endif
    // #ifndef MP-WEIXIN
    throw new Error('当前平台暂不支持导出二维码')
    // #endif
  }

  function saveImage(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      uni.saveImageToPhotosAlbum({
        filePath,
        success: () => resolve(),
        fail: err => reject(err),
      })
    })
  }

  function showModal(options: UniApp.ShowModalOptions): Promise<UniApp.ShowModalRes> {
    return new Promise((resolve) => {
      uni.showModal({ ...options, success: resolve })
    })
  }

  function openSetting(): Promise<UniApp.AuthSetting> {
    return new Promise((resolve) => {
      uni.openSetting({ success: res => resolve(res.authSetting) })
    })
  }

  async function saveToAlbum(filePath: string): Promise<boolean> {
    try {
      await saveImage(filePath)
      uni.showToast({ title: '已保存到相册', icon: 'success' })
      return true
    }
    catch {
      const { confirm } = await showModal({
        title: '需要相册权限',
        content: '保存二维码需授权写入相册，是否前往设置开启？',
        confirmText: '去设置',
      })
      if (!confirm) {
        return false
      }
      const auth = await openSetting()
      if (!auth['scope.writePhotosAlbum']) {
        return false
      }
      try {
        await saveImage(filePath)
        uni.showToast({ title: '已保存到相册', icon: 'success' })
        return true
      }
      catch {
        uni.showToast({ title: '保存失败', icon: 'none' })
        return false
      }
    }
  }

  return { drawPreview, exportPng, saveToAlbum }
}