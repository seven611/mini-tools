import { describe, expect, it } from 'vitest'
import { dateToTimestamp, formatDateTime, parseDateTime, timestampToDate } from '@/core/datetime/convert'

describe('datetime conversion (mini-program layer over it-tools models)', () => {
  describe('timestampToDate', () => {
    it('converts unix seconds to Date', () => {
      expect(timestampToDate('1234567890', 's')?.getTime()).toBe(1234567890000)
    })
    it('converts unix milliseconds to Date', () => {
      expect(timestampToDate('1234567890000', 'ms')?.getTime()).toBe(1234567890000)
    })
    it('returns null for non-numeric input', () => {
      expect(timestampToDate('abc', 's')).toBeNull()
      expect(timestampToDate('', 'ms')).toBeNull()
    })
    it('rejects millisecond values in seconds mode', () => {
      expect(timestampToDate('1234567890000', 's')).toBeNull()
    })
  })

  describe('dateToTimestamp', () => {
    it('converts Date to unix seconds', () => {
      expect(dateToTimestamp(new Date(1234567890000), 's')).toBe(1234567890)
    })
    it('converts Date to unix milliseconds', () => {
      expect(dateToTimestamp(new Date(1234567890000), 'ms')).toBe(1234567890000)
    })
  })

  describe('parseDateTime', () => {
    it('parses ISO 8601 / RFC 3339 strings', () => {
      expect(parseDateTime('2009-02-13T23:31:30Z')?.getTime()).toBe(1234567890000)
    })
    it('parses unix seconds and milliseconds', () => {
      expect(parseDateTime('1234567890')?.getTime()).toBe(1234567890000)
      expect(parseDateTime('1234567890000')?.getTime()).toBe(1234567890000)
    })
    it('parses ISO 9075 with space separator', () => {
      expect(parseDateTime('2009-02-13 23:31:30Z')?.getTime()).toBe(1234567890000)
    })
    it('parses local datetime strings', () => {
      const parsed = parseDateTime('2009-02-13 23:31:30')
      expect(parsed).not.toBeNull()
      expect(parsed!.getFullYear()).toBe(2009)
    })
    it('returns null for garbage and empty input', () => {
      expect(parseDateTime('foo')).toBeNull()
      expect(parseDateTime('')).toBeNull()
    })
  })

  describe('formatDateTime', () => {
    it('formats with the default pattern in local time', () => {
      expect(formatDateTime(new Date(2009, 1, 13, 23, 31, 30))).toBe('2009-02-13 23:31:30')
    })
    it('supports custom patterns', () => {
      expect(formatDateTime(new Date(2009, 1, 13), 'yyyy/MM/dd')).toBe('2009/02/13')
    })
  })
})