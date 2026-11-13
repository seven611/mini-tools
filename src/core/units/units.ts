/*
 * Original for 随手口袋工具 (GPL-3.0). 单位换算：以基准单位因子做两两换算。
 */

export interface UnitDef {
  id: string
  name: string
  factor: number
}

export interface UnitCategory {
  id: string
  name: string
  units: UnitDef[]
}

export const UNIT_CATEGORIES: UnitCategory[] = [
  {
    id: 'length',
    name: '长度',
    units: [
      { id: 'mm', name: '毫米', factor: 0.001 },
      { id: 'cm', name: '厘米', factor: 0.01 },
      { id: 'm', name: '米', factor: 1 },
      { id: 'km', name: '千米', factor: 1000 },
      { id: 'in', name: '英寸', factor: 0.0254 },
      { id: 'ft', name: '英尺', factor: 0.3048 },
    ],
  },
  {
    id: 'weight',
    name: '重量',
    units: [
      { id: 'g', name: '克', factor: 1 },
      { id: 'kg', name: '千克', factor: 1000 },
      { id: 't', name: '吨', factor: 1000000 },
      { id: 'oz', name: '盎司', factor: 28.349523125 },
      { id: 'lb', name: '磅', factor: 453.59237 },
    ],
  },
  {
    id: 'area',
    name: '面积',
    units: [
      { id: 'm2', name: '平方米', factor: 1 },
      { id: 'km2', name: '平方千米', factor: 1000000 },
      { id: 'ha', name: '公顷', factor: 10000 },
      { id: 'mu', name: '亩', factor: 2000 / 3 },
      { id: 'ft2', name: '平方英尺', factor: 0.09290304 },
    ],
  },
  {
    id: 'speed',
    name: '速度',
    units: [
      { id: 'ms', name: '米/秒', factor: 1 },
      { id: 'kmh', name: '千米/时', factor: 1 / 3.6 },
      { id: 'mph', name: '英里/时', factor: 0.44704 },
      { id: 'kn', name: '节', factor: 0.514444 },
    ],
  },
  {
    id: 'data',
    name: '数据',
    units: [
      { id: 'b', name: '字节 B', factor: 1 },
      { id: 'kb', name: 'KB', factor: 1024 },
      { id: 'mb', name: 'MB', factor: 1048576 },
      { id: 'gb', name: 'GB', factor: 1073741824 },
      { id: 'tb', name: 'TB', factor: 1099511627776 },
    ],
  },
]

export function convertUnit(categoryId: string, fromId: string, toId: string, value: number): number | null {
  if (!Number.isFinite(value)) return null
  const cat = UNIT_CATEGORIES.find(c => c.id === categoryId)
  if (!cat) return null
  const from = cat.units.find(u => u.id === fromId)
  const to = cat.units.find(u => u.id === toId)
  if (!from || !to) return null
  return (value * from.factor) / to.factor
}