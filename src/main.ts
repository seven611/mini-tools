import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// #ifdef MP-WEIXIN
// iOS 小程序 JavaScriptCore 无 TextEncoder 全局，qrcode byte-data 依赖它，补最小 UTF-8 实现
if (typeof (globalThis as any).TextEncoder === 'undefined') {
  ;(globalThis as any).TextEncoder = class {
    encode(s: string): Uint8Array {
      const bytes: number[] = []
      for (const ch of s) {
        const cp = ch.codePointAt(0)!
        if (cp < 0x80) bytes.push(cp)
        else if (cp < 0x800) bytes.push(0xC0 | (cp >> 6), 0x80 | (cp & 63))
        else if (cp < 0x10000) bytes.push(0xE0 | (cp >> 12), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63))
        else bytes.push(0xF0 | (cp >> 18), 0x80 | ((cp >> 12) & 63), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63))
      }
      return new Uint8Array(bytes)
    }
  }
}
// #endif

export function createApp() {
  const app = createSSRApp(App)
  app.use(createPinia())
  return { app }
}