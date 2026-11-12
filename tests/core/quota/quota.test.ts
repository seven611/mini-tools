import { describe, expect, it } from 'vitest'
import { consume, grantByAd, remaining, todayKey } from '@/core/quota/quota'

const TODAY = '2026-11-12'
const YESTERDAY = '2026-11-11'

describe('premium quota (pure local daily allowance)', () => {
  describe('todayKey', () => {
    it('formats local date with zero padding', () => {
      expect(todayKey(new Date(2026, 0, 5))).toBe('2026-01-05')
      expect(todayKey(new Date(2026, 10, 12))).toBe('2026-11-12')
    })
  })

  describe('consume', () => {
    it('uses the daily free allowance first', () => {
      const { state, source } = consume({}, 'qr-hd', TODAY)
      expect(source).toBe('free')
      expect(state['qr-hd']).toEqual({ date: TODAY, freeUsed: 1, adGranted: 0 })
    })

    it('returns none without touching state when nothing is left', () => {
      const before = { 'qr-hd': { date: TODAY, freeUsed: 1, adGranted: 0 } }
      const { state, source } = consume(before, 'qr-hd', TODAY)
      expect(source).toBe('none')
      expect(state).toEqual(before)
    })

    it('spends ad-granted uses after the free one', () => {
      let state = grantByAd({}, 'qr-hd', TODAY)
      const first = consume(state, 'qr-hd', TODAY)
      expect(first.source).toBe('free')
      state = first.state
      const second = consume(state, 'qr-hd', TODAY)
      expect(second.source).toBe('ad')
      expect(second.state['qr-hd']).toEqual({ date: TODAY, freeUsed: 1, adGranted: 0 })
      const third = consume(second.state, 'qr-hd', TODAY)
      expect(third.source).toBe('none')
    })

    it('resets on a new day', () => {
      const before = { 'qr-hd': { date: YESTERDAY, freeUsed: 1, adGranted: 2 } }
      const { state, source } = consume(before, 'qr-hd', TODAY)
      expect(source).toBe('free')
      expect(state['qr-hd']).toEqual({ date: TODAY, freeUsed: 1, adGranted: 0 })
    })

    it('keeps features independent', () => {
      const a = consume({}, 'qr-hd', TODAY).state
      const b = consume(a, 'wifi-batch', TODAY)
      expect(b.source).toBe('free')
      expect(b.state['qr-hd'].freeUsed).toBe(1)
      expect(b.state['wifi-batch'].freeUsed).toBe(1)
    })

    it('does not mutate the input state', () => {
      const before = { 'qr-hd': { date: TODAY, freeUsed: 0, adGranted: 1 } }
      const snapshot = JSON.stringify(before)
      consume(before, 'qr-hd', TODAY)
      expect(JSON.stringify(before)).toBe(snapshot)
    })
  })

  describe('grantByAd', () => {
    it('adds one ad-granted use', () => {
      const state = grantByAd(grantByAd({}, 'qr-hd', TODAY), 'qr-hd', TODAY)
      expect(state['qr-hd']).toEqual({ date: TODAY, freeUsed: 0, adGranted: 2 })
    })

    it('rolls over a stale entry before granting', () => {
      const before = { 'qr-hd': { date: YESTERDAY, freeUsed: 1, adGranted: 3 } }
      const state = grantByAd(before, 'qr-hd', TODAY)
      expect(state['qr-hd']).toEqual({ date: TODAY, freeUsed: 0, adGranted: 1 })
    })
  })

  describe('remaining', () => {
    it('reports free and ad allowances for today', () => {
      const state = grantByAd(consume({}, 'qr-hd', TODAY).state, 'qr-hd', TODAY)
      expect(remaining(state, 'qr-hd', TODAY)).toEqual({ free: 0, ad: 1 })
    })

    it('reports a fresh allowance for unknown or stale features', () => {
      expect(remaining({}, 'qr-hd', TODAY)).toEqual({ free: 1, ad: 0 })
      expect(remaining({ 'qr-hd': { date: YESTERDAY, freeUsed: 1, adGranted: 2 } }, 'qr-hd', TODAY))
        .toEqual({ free: 1, ad: 0 })
    })
  })
})