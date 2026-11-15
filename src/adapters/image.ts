/*
 * Original for 随手口袋工具 (GPL-3.0). 图片适配层：选择/压缩/保存，纯本地、不上传。
 * MP-WEIXIN 用 wx.compressImage；H5 用 canvas 重绘导出 JPEG。
 */

import { targetSize } from '@/core/image/compress'

export interface ChosenImage {
  path: string
  size: number
  width: number
  height: number
}

export interface CompressedImage {
  path: string
  size: number
  width: number
  height: number
}

export function chooseImage(): Promise<ChosenImage> {
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count: 1,
      sizeType: ['original'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const path = res.tempFilePaths[0]
        const size = (res.tempFiles as any[])[0]?.size ?? 0
        try {
          const info = await uni.getImageInfo({ src: path })
          resolve({ path, size, width: info.width, height: info.height })
        }
        catch {
          resolve({ path, size, width: 0, height: 0 })
        }
      },
      fail: reject,
    })
  })
}

export async function compressImage(src: string, opts: { quality: number, width: number, height: number }): Promise<CompressedImage> {
  const { quality, width, height } = opts
  // #ifdef MP-WEIXIN
  const { tempFilePath } = await wx.compressImage({
    src,
    quality: Math.round(quality * 100),
    compressedWidth: width,
    compressedHeight: height,
  })
  const info = await uni.getFileInfo({ filePath: tempFilePath })
  return { path: tempFilePath, size: (info as any).size ?? 0, width, height }
  // #endif
  // #ifndef MP-WEIXIN
  const img = await loadImage(src)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(img, 0, 0, width, height)
  const dataUrl = canvas.toDataURL('image/jpeg', quality)
  const size = Math.round((dataUrl.length - 'data:image/jpeg;base64,'.length) * 3 / 4)
  return { path: dataUrl, size, width, height }
  // #endif
}

// #ifndef MP-WEIXIN
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}
// #endif

export function saveImage(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    uni.saveImageToPhotosAlbum({
      filePath,
      success: () => resolve(),
      fail: reject,
    })
  })
}

export async function saveWithRetry(filePath: string): Promise<boolean> {
  try {
    await saveImage(filePath)
    uni.showToast({ title: '已保存到相册', icon: 'success' })
    return true
  }
  catch {
    const { confirm } = await uni.showModal({
      title: '需要相册权限',
      content: '保存图片需授权写入相册，是否前往设置开启？',
      confirmText: '去设置',
    })
    if (!confirm) return false
    const auth = await uni.openSetting({})
    if (!auth.authSetting['scope.writePhotosAlbum']) return false
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

export { targetSize }