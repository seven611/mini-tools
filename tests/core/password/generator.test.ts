import { describe, expect, it } from 'vitest'
import { createToken } from '@/core/password/generator'
import { createSeededRng } from '@/core/shared/random'

describe('password generator (ported from it-tools token-generator)', () => {
  it('generates an empty string when all charset params are false', () => {
    const token = createToken({
      withLowercase: false,
      withUppercase: false,
      withNumbers: false,
      withSymbols: false,
      length: 10,
    })
    expect(token).toHaveLength(0)
  })

  it('generates a random string with the specified length', () => {
    for (const length of [5, 10, 100]) {
      expect(createToken({
        withLowercase: true,
        withUppercase: true,
        withNumbers: true,
        withSymbols: true,
        length,
      })).toHaveLength(length)
    }
  })

  it('generates only uppercase when only withUppercase is set', () => {
    const token = createToken({ withLowercase: false, withUppercase: true, withNumbers: false, withSymbols: false, length: 256 })
    expect(token).toHaveLength(256)
    expect(token).toMatch(/^[A-Z]+$/)
  })

  it('includes the letter N in the uppercase alphabet (upstream bug fix)', () => {
    const token = createToken({ withLowercase: false, withUppercase: true, withNumbers: false, withSymbols: false, length: 4096 })
    expect(token).toMatch(/N/)
  })

  it('includes the letter n in the lowercase alphabet (upstream bug fix)', () => {
    const token = createToken({ withLowercase: true, withUppercase: false, withNumbers: false, withSymbols: false, length: 4096 })
    expect(token).toMatch(/n/)
  })

  it('generates only lowercase when only withLowercase is set', () => {
    const token = createToken({ withLowercase: true, withUppercase: false, withNumbers: false, withSymbols: false, length: 256 })
    expect(token).toMatch(/^[a-z]+$/)
  })

  it('generates only numbers when only withNumbers is set', () => {
    const token = createToken({ withLowercase: false, withUppercase: false, withNumbers: true, withSymbols: false, length: 256 })
    expect(token).toMatch(/^[0-9]+$/)
  })

  it('generates only symbols when only withSymbols is set', () => {
    const token = createToken({ withLowercase: false, withUppercase: false, withNumbers: false, withSymbols: true, length: 256 })
    expect(token).toMatch(/^[.,;:!?./\-"'#{([-|\\@)\]=}*+]+$/)
  })

  it('generates only letters when both cases are set', () => {
    const token = createToken({ withLowercase: true, withUppercase: true, withNumbers: false, withSymbols: false, length: 256 })
    expect(token).toMatch(/^[a-zA-Z]+$/)
  })

  it('uses a custom alphabet when provided', () => {
    const token = createToken({ alphabet: 'ab', length: 32 })
    expect(token).toMatch(/^[ab]+$/)
  })

  it('is deterministic given a seeded rng', () => {
    const options = { length: 16, withSymbols: true }
    const a = createToken({ ...options, rng: createSeededRng(42) })
    const b = createToken({ ...options, rng: createSeededRng(42) })
    expect(a).toBe(b)
  })
})