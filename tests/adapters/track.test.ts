import { afterEach, describe, expect, it, vi } from 'vitest'
import { trackEvent, trackToolUse } from '@/adapters/track'

describe('track adapter', () => {
  afterEach(() => {
    delete (globalThis as any).wx
  })

  it('no-op when wx absent (H5)', () => {
    expect(() => trackToolUse('qr-code')).not.toThrow()
  })

  it('uses wx.reportEvent when available', () => {
    const reportEvent = vi.fn()
    ;(globalThis as any).wx = { reportEvent }
    trackToolUse('image-compressor')
    expect(reportEvent).toHaveBeenCalledWith('tool_use', { tool_id: 'image-compressor' })
  })

  it('falls back to wx.reportAnalytics', () => {
    const reportAnalytics = vi.fn()
    ;(globalThis as any).wx = { reportAnalytics }
    trackEvent('custom', { a: 1 })
    expect(reportAnalytics).toHaveBeenCalledWith('custom', { a: 1 })
  })
})