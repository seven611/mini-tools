import { describe, expect, it } from 'vitest'
import { rmbToUppercase } from '@/core/rmb/uppercase'

describe('rmb uppercase (original, financial convention)', () => {
  it.each([
    [0, '零元整'],
    [100, '壹佰元整'],
    [1001, '壹仟零壹元整'],
    [1010, '壹仟零壹拾元整'],
    [10, '壹拾元整'],
    [100000, '壹拾万元整'],
    [10000001, '壹仟万零壹元整'],
    [100100, '壹拾万零壹佰元整'],
    [100000000, '壹亿元整'],
    [100000001, '壹亿零壹元整'],
    [1000000000000, '壹万亿元整'],
    [1234567890.12, '壹拾贰亿叁仟肆佰伍拾陆万柒仟捌佰玖拾元壹角贰分'],
  ])('converts integer %s to %s', (input, expected) => {
    expect(rmbToUppercase(input)).toBe(expected)
  })

  it.each([
    [0.05, '伍分'],
    [0.5, '伍角'],
    [0.55, '伍角伍分'],
    [1.05, '壹元零伍分'],
  ])('converts decimal %s to %s', (input, expected) => {
    expect(rmbToUppercase(input)).toBe(expected)
  })

  it('prefixes 负 for negative amounts', () => {
    expect(rmbToUppercase(-5)).toBe('负伍元整')
    expect(rmbToUppercase(-0.5)).toBe('负伍角')
  })

  it('treats negative zero as zero', () => {
    expect(rmbToUppercase(-0)).toBe('零元整')
  })

  it('rounds half-up to fen', () => {
    expect(rmbToUppercase(1.005)).toBe('壹元零壹分')
    expect(rmbToUppercase('12.345')).toBe('壹拾贰元叁角伍分')
    expect(rmbToUppercase('9.999')).toBe('壹拾元整')
  })

  it('accepts trimmed numeric strings with leading zeros', () => {
    expect(rmbToUppercase(' 100 ')).toBe('壹佰元整')
    expect(rmbToUppercase('007')).toBe('柒元整')
  })

  it.each([
    ['abc'],
    [''],
    ['   '],
    ['1.2.3'],
    ['1e5'],
    [Number.NaN],
    [Number.POSITIVE_INFINITY],
    [1e16],
  ])('returns null for invalid or out-of-range input %s', (input) => {
    expect(rmbToUppercase(input as string | number)).toBeNull()
  })
})