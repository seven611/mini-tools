/*
 * Original for 随手口袋工具 (GPL-3.0). 平台适配层：安全随机字节。
 * 微信端用 wx.getRandomValues（密码学安全），其余端用 Web Crypto。
 */

export async function getRandomBytes(length: number): Promise<Uint8Array> {
  // #ifdef MP-WEIXIN
  const { randomValues } = await wx.getRandomValues({ length })
  return new Uint8Array(randomValues)
  // #endif
  // #ifndef MP-WEIXIN
  const bytes = new Uint8Array(length)
  globalThis.crypto.getRandomValues(bytes)
  return bytes
  // #endif
}