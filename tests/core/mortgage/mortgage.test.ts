import { describe, expect, it } from 'vitest'
import { equalInstallment, equalPrincipal } from '@/core/mortgage/mortgage'

describe('equalInstallment 等额本息', () => {
  it('100万 30年 3.6% 月供约 4546.45', () => {
    const r = equalInstallment({ principal: 1000000, years: 30, annualRatePercent: 3.6 })!
    expect(r.monthly).toBeCloseTo(4546.45, 1)
    expect(r.schedule).toHaveLength(360)
    expect(r.totalPayment).toBeCloseTo(r.monthly * 360, -1)
    expect(r.totalInterest).toBeCloseTo(r.totalPayment - 1000000, 0)
  })

  it('首月利息 = 本金 × 月利率，末月剩余归零', () => {
    const r = equalInstallment({ principal: 1000000, years: 30, annualRatePercent: 3.6 })!
    expect(r.schedule[0].interest).toBeCloseTo(3000, 2)
    expect(r.schedule[359].remaining).toBeCloseTo(0, 0)
  })

  it('零利率退化为平均分摊', () => {
    const r = equalInstallment({ principal: 120000, years: 10, annualRatePercent: 0 })!
    expect(r.monthly).toBeCloseTo(1000, 6)
    expect(r.totalInterest).toBe(0)
  })

  it('非法输入返回 null', () => {
    expect(equalInstallment({ principal: 0, years: 30, annualRatePercent: 3.6 })).toBeNull()
    expect(equalInstallment({ principal: 100000, years: 0, annualRatePercent: 3.6 })).toBeNull()
    expect(equalInstallment({ principal: 100000, years: 30, annualRatePercent: -1 })).toBeNull()
    expect(equalInstallment({ principal: NaN, years: 30, annualRatePercent: 3.6 })).toBeNull()
  })
})

describe('equalPrincipal 等额本金', () => {
  it('首月月供 = 月本金 + 首月利息，逐月递减', () => {
    const r = equalPrincipal({ principal: 120000, years: 10, annualRatePercent: 3.6 })!
    expect(r.schedule[0].principal).toBeCloseTo(1000, 6)
    expect(r.schedule[0].interest).toBeCloseTo(360, 6)
    expect(r.monthly).toBeCloseTo(1360, 6)
    expect(r.schedule[1].payment).toBeLessThan(r.schedule[0].payment)
    expect(r.schedule[119].remaining).toBeCloseTo(0, 0)
  })

  it('总利息低于等额本息', () => {
    const input = { principal: 1000000, years: 30, annualRatePercent: 3.6 }
    const a = equalInstallment(input)!
    const b = equalPrincipal(input)!
    expect(b.totalInterest).toBeLessThan(a.totalInterest)
  })
})