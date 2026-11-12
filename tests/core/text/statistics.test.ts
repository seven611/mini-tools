import { describe, expect, it } from 'vitest'
import { getCharacterCount, getLineCount, getStringSizeInBytes, getWordCount } from '@/core/text/statistics'

describe('text statistics (ported from it-tools text-statistics)', () => {
  describe('getStringSizeInBytes', () => {
    it('returns the UTF-8 size of a string in bytes', () => {
      expect(getStringSizeInBytes('')).toEqual(0)
      expect(getStringSizeInBytes('a')).toEqual(1)
      expect(getStringSizeInBytes('aa')).toEqual(2)
      expect(getStringSizeInBytes('😀')).toEqual(4)
      expect(getStringSizeInBytes('aaaaaaaaaa')).toEqual(10)
    })

    it('counts Chinese characters as 3 bytes', () => {
      expect(getStringSizeInBytes('你好')).toEqual(6)
    })
  })

  describe('getCharacterCount', () => {
    it('counts unicode code points, not UTF-16 units', () => {
      expect(getCharacterCount('')).toBe(0)
      expect(getCharacterCount('abc')).toBe(3)
      expect(getCharacterCount('😀😀')).toBe(2)
      expect(getCharacterCount('你好世界')).toBe(4)
    })
  })

  describe('getLineCount', () => {
    it('returns 0 for empty text', () => {
      expect(getLineCount('')).toBe(0)
    })
    it('counts lines across newline styles', () => {
      expect(getLineCount('a')).toBe(1)
      expect(getLineCount('a\nb')).toBe(2)
      expect(getLineCount('a\r\nb\rc')).toBe(3)
    })
  })

  describe('getWordCount', () => {
    it('returns 0 for empty text', () => {
      expect(getWordCount('')).toBe(0)
    })
    it('counts latin words by whitespace', () => {
      expect(getWordCount('hello world')).toBe(2)
    })
    it('counts each CJK character as one word', () => {
      expect(getWordCount('你好世界')).toBe(4)
    })
    it('mixes CJK characters and latin words', () => {
      expect(getWordCount('你好 hello 世界')).toBe(5)
    })
  })
})