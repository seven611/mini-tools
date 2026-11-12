import { describe, expect, it } from 'vitest'
import { percentChange, percentOf, whatPercent } from '@/core/math/percentage'

describe('percentage calculator (ported from it-tools percentage-calculator)', () => {
  describe('percentOf: X% of Y', () => {
    it('computes 20% of 50 as 10', () => {
      expect(percentOf(20, 50)).toBe(10)
    })
    it('computes 0% of Y as 0', () => {
      expect(percentOf(0, 50)).toBe(0)
    })
    it('supports fractional percentages', () => {
      expect(percentOf(12.5, 80)).toBe(10)
    })
  })

  describe('whatPercent: X is what percent of Y', () => {
    it('computes 10 as 20% of 50', () => {
      expect(whatPercent(10, 50)).toBe(20)
    })
    it('returns null when Y is zero', () => {
      expect(whatPercent(1, 0)).toBeNull()
    })
    it('returns null for non-finite results', () => {
      expect(whatPercent(Number.POSITIVE_INFINITY, 1)).toBeNull()
    })
  })

  describe('percentChange: increase/decrease from A to B', () => {
    it('computes 100 to 150 as +50%', () => {
      expect(percentChange(100, 150)).toBe(50)
    })
    it('computes 200 to 100 as -50%', () => {
      expect(percentChange(200, 100)).toBe(-50)
    })
    it('computes no change as 0', () => {
      expect(percentChange(50, 50)).toBe(0)
    })
    it('returns null when base is zero', () => {
      expect(percentChange(0, 5)).toBeNull()
    })
  })
})