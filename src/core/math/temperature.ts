/*
 * Ported from it-tools (https://github.com/CorentinTh/it-tools), Copyright Corentin Thomasset, GPL-3.0.
 * Modified for 随手口袋工具: 16 个两两换算函数收敛为开尔文枢纽的通用换算；新增中文单位表。详见 UPSTREAM.md。
 */

export type TemperatureUnit = 'celsius' | 'kelvin' | 'fahrenheit' | 'rankine' | 'delisle' | 'newton' | 'reaumur' | 'romer'

export const TEMPERATURE_UNITS: { value: TemperatureUnit, label: string }[] = [
  { value: 'celsius', label: '摄氏度 °C' },
  { value: 'fahrenheit', label: '华氏度 °F' },
  { value: 'kelvin', label: '开尔文 K' },
  { value: 'rankine', label: '兰金度 °R' },
  { value: 'delisle', label: '德利尔度 °De' },
  { value: 'newton', label: '牛顿度 °N' },
  { value: 'reaumur', label: '列氏度 °Ré' },
  { value: 'romer', label: '罗默度 °Rø' },
]

const toKelvin: Record<TemperatureUnit, (t: number) => number> = {
  celsius: t => t + 273.15,
  kelvin: t => t,
  fahrenheit: t => (t + 459.67) * (5 / 9),
  rankine: t => t * (5 / 9),
  delisle: t => 373.15 - (2 / 3) * t,
  newton: t => t * (100 / 33) + 273.15,
  reaumur: t => t * (5 / 4) + 273.15,
  romer: t => (t - 7.5) * (40 / 21) + 273.15,
}

const fromKelvin: Record<TemperatureUnit, (t: number) => number> = {
  celsius: t => t - 273.15,
  kelvin: t => t,
  fahrenheit: t => t * (9 / 5) - 459.67,
  rankine: t => t * (9 / 5),
  delisle: t => (3 / 2) * (373.15 - t),
  newton: t => (t - 273.15) * (33 / 100),
  reaumur: t => (t - 273.15) * (4 / 5),
  romer: t => (t - 273.15) * (21 / 40) + 7.5,
}

export function convertTemperature(value: number, from: TemperatureUnit, to: TemperatureUnit): number {
  return fromKelvin[to](toKelvin[from](value))
}