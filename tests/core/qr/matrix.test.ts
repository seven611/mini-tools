import { describe, expect, it } from 'vitest'
import { createQrMatrix } from '@/core/qr/matrix'

describe('qr matrix (qrcode.create wrapper for mini-program canvas)', () => {
  it('returns null for empty or whitespace text', () => {
    expect(createQrMatrix('')).toBeNull()
    expect(createQrMatrix('   ')).toBeNull()
  })

  it('produces a square boolean matrix of at least version 1 size', () => {
    const matrix = createQrMatrix('https://example.com')!
    expect(matrix.size).toBeGreaterThanOrEqual(21)
    expect(matrix.modules).toHaveLength(matrix.size)
    for (const row of matrix.modules) {
      expect(row).toHaveLength(matrix.size)
      for (const cell of row) {
        expect(typeof cell).toBe('boolean')
      }
    }
  })

  it('has finder patterns at three corners', () => {
    const { modules, size } = createQrMatrix('hello')!
    expect(modules[0][0]).toBe(true)
    expect(modules[0][size - 1]).toBe(true)
    expect(modules[size - 1][0]).toBe(true)
    expect(modules[0][6]).toBe(true)
    expect(modules[6][0]).toBe(true)
  })

  it('is deterministic for the same input', () => {
    expect(createQrMatrix('deterministic')).toEqual(createQrMatrix('deterministic'))
  })

  it('trims surrounding whitespace like upstream', () => {
    expect(createQrMatrix('  hello  ')).toEqual(createQrMatrix('hello'))
  })

  it('grows or keeps size with higher error correction', () => {
    const text = 'https://example.com/some/longer/path?with=query'
    const m = createQrMatrix(text, 'M')!
    const h = createQrMatrix(text, 'H')!
    expect(h.size).toBeGreaterThanOrEqual(m.size)
  })
})