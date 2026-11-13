/*
 * Original for 随手口袋工具 (GPL-3.0). Base64 编解码：手工 UTF-8，小程序无 btoa/atob 依赖。
 */

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

function utf8Bytes(text: string): number[] {
  const bytes: number[] = []
  for (const ch of text) {
    const cp = ch.codePointAt(0)!
    if (cp < 0x80) bytes.push(cp)
    else if (cp < 0x800) bytes.push(0xC0 | (cp >> 6), 0x80 | (cp & 63))
    else if (cp < 0x10000) bytes.push(0xE0 | (cp >> 12), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63))
    else bytes.push(0xF0 | (cp >> 18), 0x80 | ((cp >> 12) & 63), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63))
  }
  return bytes
}

export function base64Encode(text: string): string {
  const bytes = utf8Bytes(text)
  let out = ''
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i]
    const b1 = bytes[i + 1]
    const b2 = bytes[i + 2]
    out += B64[b0 >> 2]
    out += B64[((b0 & 3) << 4) | ((b1 ?? 0) >> 4)]
    out += b1 == null ? '=' : B64[((b1 & 15) << 2) | ((b2 ?? 0) >> 6)]
    out += b2 == null ? '=' : B64[b2 & 63]
  }
  return out
}

export function base64Decode(b64: string): string | null {
  const s = b64.trim()
  if (s === '') return ''
  if (s.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(s)) return null
  const clean = s.replace(/=+$/, '')

  const bytes: number[] = []
  for (let i = 0; i < clean.length; i += 4) {
    const c0 = B64.indexOf(clean[i])
    const c1 = B64.indexOf(clean[i + 1])
    const c2 = clean[i + 2] != null ? B64.indexOf(clean[i + 2]) : -1
    const c3 = clean[i + 3] != null ? B64.indexOf(clean[i + 3]) : -1
    if (c0 < 0 || c1 < 0) return null
    bytes.push((c0 << 2) | (c1 >> 4))
    if (c2 >= 0) bytes.push(((c1 & 15) << 4) | (c2 >> 2))
    if (c3 >= 0) bytes.push(((c2 & 3) << 6) | c3)
  }

  let out = ''
  let i = 0
  while (i < bytes.length) {
    const b = bytes[i]
    let cp: number
    let extra: number
    if (b < 0x80) { cp = b; extra = 0 }
    else if (b < 0xE0) { cp = b & 31; extra = 1 }
    else if (b < 0xF0) { cp = b & 15; extra = 2 }
    else { cp = b & 7; extra = 3 }
    for (let k = 1; k <= extra; k++) {
      const cb = bytes[i + k]
      if (cb == null || (cb & 0xC0) !== 0x80) return null
      cp = (cp << 6) | (cb & 63)
    }
    i += extra + 1
    out += String.fromCodePoint(cp)
  }
  return out
}