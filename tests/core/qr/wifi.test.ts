import { describe, expect, it } from 'vitest'
import { escapeString, getQrCodeText } from '@/core/qr/wifi'

const base = {
  ssid: 'MyWiFi',
  password: 'secret',
  encryption: 'WPA' as const,
  isHiddenSSID: false,
  eapAnonymous: false,
  eapIdentity: '',
  eapPhase2Method: 'None' as const,
}

describe('wifi qr payload (ported from it-tools wifi-qr-code-generator)', () => {
  it('builds a minimal payload for open networks', () => {
    expect(getQrCodeText({ ...base, encryption: 'nopass' })).toBe('WIFI:S:MyWiFi;;')
  })

  it('builds a WPA payload with password', () => {
    expect(getQrCodeText(base)).toBe('WIFI:S:MyWiFi;T:WPA;P:secret;;')
  })

  it('adds H:true for hidden networks', () => {
    expect(getQrCodeText({ ...base, isHiddenSSID: true })).toBe('WIFI:S:MyWiFi;T:WPA;P:secret;H:true;')
  })

  it('escapes backslash, semicolon, comma, colon and quote', () => {
    expect(escapeString('a\\b;c,d:e"f')).toBe('a\\\\b\\;c\\,d\\:e\\"f')
    expect(getQrCodeText({ ...base, ssid: 'café;net', password: 'p:a,ss' }))
      .toBe('WIFI:S:café\\;net;T:WPA;P:p\\:a\\,ss;;')
  })

  it('returns null without ssid', () => {
    expect(getQrCodeText({ ...base, ssid: '' })).toBeNull()
  })

  it('returns null for WPA without password', () => {
    expect(getQrCodeText({ ...base, password: '' })).toBeNull()
  })

  it('builds a WPA2-EAP payload with identity', () => {
    expect(getQrCodeText({
      ...base,
      encryption: 'WPA2-EAP',
      eapMethod: 'TTLS',
      eapIdentity: 'user',
    })).toBe('WIFI:S:MyWiFi;T:WPA2-EAP;P:secret;E:TTLS;I:user;;')
  })

  it('uses anonymous identity when checked', () => {
    expect(getQrCodeText({
      ...base,
      encryption: 'WPA2-EAP',
      eapMethod: 'TTLS',
      eapAnonymous: true,
    })).toBe('WIFI:S:MyWiFi;T:WPA2-EAP;P:secret;E:TTLS;A:anon;;')
  })

  it('includes phase 2 method when not None', () => {
    expect(getQrCodeText({
      ...base,
      encryption: 'WPA2-EAP',
      eapMethod: 'PEAP',
      eapIdentity: 'user',
      eapPhase2Method: 'MSCHAPV2',
    })).toBe('WIFI:S:MyWiFi;T:WPA2-EAP;P:secret;E:PEAP;PH2:MSCHAPV2;I:user;;')
  })

  it('returns null for EAP without identity and not anonymous', () => {
    expect(getQrCodeText({ ...base, encryption: 'WPA2-EAP', eapMethod: 'TTLS' })).toBeNull()
  })

  it('returns null for PEAP without phase 2 method', () => {
    expect(getQrCodeText({
      ...base,
      encryption: 'WPA2-EAP',
      eapMethod: 'PEAP',
      eapIdentity: 'user',
      eapPhase2Method: 'None',
    })).toBeNull()
  })
})