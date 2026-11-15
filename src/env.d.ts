/// <reference types="vite/client" />

declare module 'qrcode/lib/core/qrcode' {
  const QRCode: {
    create: (data: string, options?: { errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H' }) => {
      modules: { size: number; data: Uint8Array }
    }
  }
  export default QRCode
}

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}
