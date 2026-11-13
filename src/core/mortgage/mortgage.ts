/*
 * Original for 随手口袋工具 (GPL-3.0). 房贷计算：等额本息 / 等额本金纯函数，逐月明细。
 */

export interface MortgageInput {
  principal: number
  years: number
  annualRatePercent: number
}

export interface MonthEntry {
  month: number
  payment: number
  principal: number
  interest: number
  remaining: number
}

export interface MortgageResult {
  monthly: number
  totalInterest: number
  totalPayment: number
  schedule: MonthEntry[]
}

const round2 = (n: number) => Math.round(n * 100) / 100

function validateMonths({ principal, years, annualRatePercent }: MortgageInput): number | null {
  if (!Number.isFinite(principal) || principal <= 0) return null
  if (!Number.isFinite(years) || years <= 0 || !Number.isInteger(years)) return null
  if (!Number.isFinite(annualRatePercent) || annualRatePercent < 0) return null
  return years * 12
}

export function equalInstallment(input: MortgageInput): MortgageResult | null {
  const n = validateMonths(input)
  if (n == null) return null
  const { principal, annualRatePercent } = input
  const r = annualRatePercent / 100 / 12
  const monthly = r === 0 ? principal / n : (principal * r * (1 + r) ** n) / ((1 + r) ** n - 1)

  const schedule: MonthEntry[] = []
  let remaining = principal
  let totalInterest = 0
  for (let m = 1; m <= n; m++) {
    const interest = round2(remaining * r)
    let prin = round2(monthly - interest)
    let payment = round2(monthly)
    if (m === n) {
      prin = round2(remaining)
      payment = round2(prin + interest)
    }
    remaining = round2(remaining - prin)
    totalInterest += interest
    schedule.push({ month: m, payment, principal: prin, interest, remaining })
  }
  return {
    monthly: round2(monthly),
    totalInterest: round2(totalInterest),
    totalPayment: round2(principal + totalInterest),
    schedule,
  }
}

export function equalPrincipal(input: MortgageInput): MortgageResult | null {
  const n = validateMonths(input)
  if (n == null) return null
  const { principal, annualRatePercent } = input
  const r = annualRatePercent / 100 / 12
  const basePrin = principal / n

  const schedule: MonthEntry[] = []
  let remaining = principal
  let totalInterest = 0
  for (let m = 1; m <= n; m++) {
    const interest = round2(remaining * r)
    const prin = m === n ? round2(remaining) : round2(basePrin)
    const payment = round2(prin + interest)
    remaining = round2(remaining - prin)
    totalInterest += interest
    schedule.push({ month: m, payment, principal: prin, interest, remaining })
  }
  return {
    monthly: schedule[0].payment,
    totalInterest: round2(totalInterest),
    totalPayment: round2(principal + totalInterest),
    schedule,
  }
}