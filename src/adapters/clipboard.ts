/*
 * Original for 随手口袋工具 (GPL-3.0). 平台适配层：剪贴板。
 * 只做用户主动复制，不读取剪贴板（隐私合规）。
 */

export function copyText(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    uni.setClipboardData({
      data: text,
      success: () => resolve(),
      fail: err => reject(err),
    })
  })
}