import { describe, expect, it } from 'vitest'
import { getCharsetLength, getPasswordCrackTimeEstimation } from '@/core/password/strength'

describe('password strength (ported from it-tools password-strength-analyser)', () => {
  describe('getCharsetLength', () => {
    it('is 26 for only lowercase', () => {
      expect(getCharsetLength({ password: 'abcdefghijklmnopqrstuvwxyz' })).toBe(26)
    })
    it('is 26 for only uppercase', () => {
      expect(getCharsetLength({ password: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' })).toBe(26)
    })
    it('is 10 for only digits', () => {
      expect(getCharsetLength({ password: '0123456789' })).toBe(10)
    })
    it('is 32 for only special characters', () => {
      expect(getCharsetLength({ password: '-_(' })).toBe(32)
    })
    it('is 0 for empty password', () => {
      expect(getCharsetLength({ password: '' })).toBe(0)
    })
    it('is 36 for lowercase and digits', () => {
      expect(getCharsetLength({ password: 'abcdefghijklmnopqrstuvwxyz0123456789' })).toBe(36)
    })
    it('is 94 for all four classes', () => {
      expect(getCharsetLength({ password: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_(' })).toBe(94)
    })
  })

  describe('getPasswordCrackTimeEstimation', () => {
    it('returns zero entropy and instant crack for empty password', () => {
      const result = getPasswordCrackTimeEstimation({ password: '' })
      expect(result.entropy).toBe(0)
      expect(result.score).toBe(0)
      expect(result.crackDurationFormatted).toBe('瞬间')
    })

    it('computes entropy as log2(charset) * length', () => {
      const result = getPasswordCrackTimeEstimation({ password: 'abc' })
      expect(result.charsetLength).toBe(26)
      expect(result.passwordLength).toBe(3)
      expect(result.entropy).toBeCloseTo(Math.log2(26) * 3, 10)
    })

    it('formats durations in Chinese with at most two units', () => {
      expect(getPasswordCrackTimeEstimation({ password: 'a', guessesPerSecond: 1 }).crackDurationFormatted).toBe('26 秒')
      expect(getPasswordCrackTimeEstimation({ password: 'ab', guessesPerSecond: 1 }).crackDurationFormatted).toBe('11 分钟，16 秒')
    })

    it('reports less than a second for sub-second crack times', () => {
      expect(getPasswordCrackTimeEstimation({ password: 'a', guessesPerSecond: 100 }).crackDurationFormatted).toBe('不到 1 秒')
    })

    it('caps score at 1 for very strong passwords', () => {
      const result = getPasswordCrackTimeEstimation({ password: 'aB3$xY9!qW2#eR5%tY7^uI8&oP0(sD1)fG' })
      expect(result.score).toBe(1)
      expect(result.crackDurationFormatted).toContain('年')
    })
  })
})