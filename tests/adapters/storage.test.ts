import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { readStorage, writeStorage } from '@/adapters/storage'

describe('storage adapter (JSON strings with safe fallback)', () => {
  let store: Record<string, unknown>

  beforeEach(() => {
    store = {}
    ;(globalThis as any).uni = {
      getStorageSync: (key: string) => store[key] ?? '',
      setStorageSync: (key: string, value: unknown) => {
        store[key] = value
      },
    }
  })

  afterEach(() => {
    delete (globalThis as any).uni
  })

  it('round-trips JSON values', () => {
    writeStorage('ittools:test', { a: 1 })
    expect(readStorage('ittools:test', { a: 0 })).toEqual({ a: 1 })
  })

  it('returns the fallback for missing keys', () => {
    expect(readStorage('missing', [])).toEqual([])
  })

  it('returns the fallback for corrupted JSON', () => {
    store['broken'] = '{oops'
    expect(readStorage('broken', null)).toBeNull()
  })
})