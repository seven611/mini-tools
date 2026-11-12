/*
 * Ported from it-tools (https://github.com/CorentinTh/it-tools), Copyright Corentin Thomasset, GPL-3.0.
 * Modified for 随手口袋工具: 从 useQRCode composable 提取为纯函数；可选字段给默认值；移除 Vue/平台依赖；
 * PEAP 的 phase2 为 'None' 时视为缺失（上游仅判空值）。详见 UPSTREAM.md。
 * @see https://github.com/zxing/zxing/wiki/Barcode-Contents#wi-fi-network-config-android-ios-11
 */

export const wifiEncryptions = ['WEP', 'WPA', 'nopass', 'WPA2-EAP'] as const
export type WifiEncryption = typeof wifiEncryptions[number]

// @see https://en.wikipedia.org/wiki/Extensible_Authentication_Protocol
export const EAPMethods = [
  'MD5',
  'POTP',
  'GTC',
  'TLS',
  'IKEv2',
  'SIM',
  'AKA',
  'AKA\'',
  'TTLS',
  'PWD',
  'LEAP',
  'PSK',
  'FAST',
  'TEAP',
  'EKE',
  'NOOB',
  'PEAP',
] as const
export type EAPMethod = typeof EAPMethods[number]

export const EAPPhase2Methods = [
  'None',
  'MSCHAPV2',
] as const
export type EAPPhase2Method = typeof EAPPhase2Methods[number]

export interface WifiPayloadOptions {
  ssid: string
  password: string
  encryption: WifiEncryption
  eapMethod?: EAPMethod
  isHiddenSSID?: boolean
  eapAnonymous?: boolean
  eapIdentity?: string
  eapPhase2Method?: EAPPhase2Method
}

export function escapeString(str: string) {
  // replaces \, ;, ,, " and : with the same character preceded by a backslash
  return str.replace(/([\\;,:"])/g, '\\$1')
}

export function getQrCodeText(options: WifiPayloadOptions): string | null {
  const {
    ssid,
    password,
    encryption,
    eapMethod,
    isHiddenSSID = false,
    eapAnonymous = false,
    eapIdentity = '',
    eapPhase2Method = 'None',
  } = options

  if (!ssid) {
    return null
  }
  if (encryption === 'nopass') {
    return `WIFI:S:${escapeString(ssid)};;`
  }
  if (encryption !== 'WPA2-EAP' && password) {
    return `WIFI:S:${escapeString(ssid)};T:${encryption};P:${escapeString(password)};${isHiddenSSID ? 'H:true' : ''};`
  }
  if (encryption === 'WPA2-EAP' && password && eapMethod) {
    if (!eapIdentity && !eapAnonymous) {
      return null
    }
    if (eapMethod === 'PEAP' && (!eapPhase2Method || eapPhase2Method === 'None')) {
      return null
    }
    const identity = eapAnonymous ? 'A:anon' : `I:${escapeString(eapIdentity)}`
    const phase2 = eapPhase2Method !== 'None' ? `PH2:${eapPhase2Method};` : ''
    return `WIFI:S:${escapeString(ssid)};T:WPA2-EAP;P:${escapeString(password)};E:${eapMethod};${phase2}${identity};${isHiddenSSID ? 'H:true' : ''};`
  }
  return null
}