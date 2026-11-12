import { describe, expect, it } from 'vitest'
import { TEMPERATURE_UNITS, convertTemperature } from '@/core/math/temperature'

describe('temperature converter (ported from it-tools temperature-converter)', () => {
  it('converts 0°C to 32°F', () => {
    expect(convertTemperature(0, 'celsius', 'fahrenheit')).toBeCloseTo(32, 10)
  })

  it('converts 100°C to 373.15K', () => {
    expect(convertTemperature(100, 'celsius', 'kelvin')).toBe(373.15)
  })

  it('converts 32°F to 0°C', () => {
    expect(convertTemperature(32, 'fahrenheit', 'celsius')).toBeCloseTo(0, 10)
  })

  it('converts 0°C to 491.67°R', () => {
    expect(convertTemperature(0, 'celsius', 'rankine')).toBeCloseTo(491.67, 10)
  })

  it('converts 0°De to 100°C', () => {
    expect(convertTemperature(0, 'delisle', 'celsius')).toBeCloseTo(100, 10)
  })

  it('converts 33°N to 100°C', () => {
    expect(convertTemperature(33, 'newton', 'celsius')).toBeCloseTo(100, 10)
  })

  it('converts 80°Ré to 100°C', () => {
    expect(convertTemperature(80, 'reaumur', 'celsius')).toBeCloseTo(100, 10)
  })

  it('converts 60°Rø to 100°C', () => {
    expect(convertTemperature(60, 'romer', 'celsius')).toBeCloseTo(100, 10)
  })

  it('is identity when source and target units match', () => {
    expect(convertTemperature(42, 'kelvin', 'kelvin')).toBe(42)
  })

  it('round-trips through every unit', () => {
    for (const { value } of TEMPERATURE_UNITS) {
      const there = convertTemperature(25, 'celsius', value)
      expect(convertTemperature(there, value, 'celsius')).toBeCloseTo(25, 8)
    }
  })

  it('exposes all eight units with Chinese labels', () => {
    expect(TEMPERATURE_UNITS).toHaveLength(8)
    for (const unit of TEMPERATURE_UNITS) {
      expect(unit.label.length).toBeGreaterThan(0)
    }
  })
})