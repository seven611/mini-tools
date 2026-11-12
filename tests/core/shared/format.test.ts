import { describe, expect, it } from 'vitest'
import { formatNumber, parseNumber } from '@/core/shared/format'

describe('formatNumber', () => {
  it('trims float tails', () => {
    expect(formatNumber(0.30000000000000004)).toBe('0.3')
    expect(formatNumber(31.999999999999943)).toBe('32')
  })

  it('keeps up to 6 decimals', () => {
    expect(formatNumber(1 / 3)).toBe('0.333333')
  })

  it('returns empty string for null or non-finite values', () => {
    expect(formatNumber(null)).toBe('')
    expect(formatNumber(Number.NaN)).toBe('')
    expect(formatNumber(Number.POSITIVE_INFINITY)).toBe('')
  })

  it('keeps integers intact', () => {
    expect(formatNumber(32)).toBe('32')
    expect(formatNumber(0)).toBe('0')
  })
})

describe('parseNumber', () => {
  it('parses trimmed numeric strings', () => {
    expect(parseNumber(' 12.5 ')).toBe(12.5)
    expect(parseNumber('-3')).toBe(-3)
  })

  it('returns null for empty or non-numeric input', () => {
    expect(parseNumber('')).toBeNull()
    expect(parseNumber('  ')).toBeNull()
    expect(parseNumber('abc')).toBeNull()
    expect(parseNumber('12abc')).toBeNull()
  })
})