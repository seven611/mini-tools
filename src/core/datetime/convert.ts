/*
 * Original for 随手口袋工具 (GPL-3.0), built on the ported it-tools date-time-converter models.
 * 时间戳/日期字符串互转与格式化，纯本地计算，不依赖平台 API。
 */

import { format } from 'date-fns'
import {
  excelFormatToDate,
  isExcelFormat,
  isISO8601DateTimeString,
  isISO9075DateString,
  isRFC3339DateString,
  isTimestamp,
  isUTCDateString,
  isUnixTimestamp,
} from './models'

export type TimestampUnit = 's' | 'ms'

export function timestampToDate(value: string, unit: TimestampUnit): Date | null {
  const trimmed = value.trim()
  if (unit === 's' ? !isUnixTimestamp(trimmed) : !isTimestamp(trimmed)) {
    return null
  }
  const ms = unit === 's' ? Number(trimmed) * 1000 : Number(trimmed)
  return new Date(ms)
}

export function dateToTimestamp(date: Date, unit: TimestampUnit): number {
  return unit === 's' ? Math.floor(date.getTime() / 1000) : date.getTime()
}

export function parseDateTime(input: string): Date | null {
  const value = input.trim()
  if (!value) {
    return null
  }
  if (isUnixTimestamp(value)) {
    return new Date(Number(value) * 1000)
  }
  if (isTimestamp(value)) {
    return new Date(Number(value))
  }
  if (isExcelFormat(value)) {
    return excelFormatToDate(value)
  }
  if (isISO8601DateTimeString(value) || isISO9075DateString(value) || isRFC3339DateString(value)) {
    const date = new Date(value.replace(' ', 'T'))
    return Number.isNaN(date.getTime()) ? null : date
  }
  if (isUTCDateString(value)) {
    return new Date(value)
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDateTime(date: Date, pattern = 'yyyy-MM-dd HH:mm:ss'): string {
  return format(date, pattern)
}