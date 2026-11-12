/*
 * Ported from it-tools (https://github.com/CorentinTh/it-tools), Copyright Corentin Thomasset, GPL-3.0.
 * Modified for 随手口袋工具: 字节数改为手工 UTF-8 计数（小程序无全局 TextEncoder）；
 * 新增字符/行/词统计。详见 UPSTREAM.md。
 */

export function getStringSizeInBytes(text: string) {
  let bytes = 0
  for (const char of text) {
    const codePoint = char.codePointAt(0)!
    if (codePoint <= 0x7F) {
      bytes += 1
    }
    else if (codePoint <= 0x7FF) {
      bytes += 2
    }
    else if (codePoint <= 0xFFFF) {
      bytes += 3
    }
    else {
      bytes += 4
    }
  }
  return bytes
}

export function getCharacterCount(text: string) {
  return [...text].length
}

export function getLineCount(text: string) {
  return text === '' ? 0 : text.split(/\r\n|\r|\n/).length
}

export function getWordCount(text: string) {
  return (text.match(/[一-鿿]|[A-Za-z0-9]+(?:[‘’-][A-Za-z0-9]+)*/g) ?? []).length
}