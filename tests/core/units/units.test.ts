import { describe, expect, it } from 'vitest'
import { UNIT_CATEGORIES, convertUnit } from '@/core/units/units'

describe('convertUnit', () => {
  it('长度：1 km = 1000 m，1 in = 2.54 cm', () => {
    expect(convertUnit('length', 'km', 'm', 1)).toBe(1000)
    expect(convertUnit('length', 'in', 'cm', 1)).toBeCloseTo(2.54, 10)
  })

  it('重量：1 lb ≈ 453.59237 g', () => {
    expect(convertUnit('weight', 'lb', 'g', 1)).toBeCloseTo(453.59237, 5)
  })

  it('面积：1 公顷 = 10000 m²，1 亩 ≈ 666.67 m²', () => {
    expect(convertUnit('area', 'ha', 'm2', 1)).toBe(10000)
    expect(convertUnit('area', 'mu', 'm2', 1)).toBeCloseTo(666.6667, 3)
  })

  it('速度：1 m/s = 3.6 km/h', () => {
    expect(convertUnit('speed', 'ms', 'kmh', 1)).toBeCloseTo(3.6, 10)
  })

  it('数据：1 KB = 1024 B', () => {
    expect(convertUnit('data', 'kb', 'b', 1)).toBe(1024)
  })

  it('非法输入返回 null', () => {
    expect(convertUnit('length', 'm', 'km', NaN)).toBeNull()
    expect(convertUnit('length', 'nope', 'm', 1)).toBeNull()
    expect(convertUnit('nope', 'm', 'km', 1)).toBeNull()
  })

  it('类别表结构完整：每类至少两个单位且含基准', () => {
    expect(UNIT_CATEGORIES.length).toBeGreaterThanOrEqual(5)
    for (const c of UNIT_CATEGORIES) {
      expect(c.units.length).toBeGreaterThanOrEqual(2)
      expect(c.units.some(u => u.factor === 1)).toBe(true)
    }
  })
})