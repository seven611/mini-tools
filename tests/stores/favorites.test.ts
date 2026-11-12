import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useFavoritesStore } from '@/stores/favorites'

describe('favorites store', () => {
  let store: Record<string, unknown>

  beforeEach(() => {
    store = {}
    ;(globalThis as any).uni = {
      getStorageSync: (key: string) => store[key] ?? '',
      setStorageSync: (key: string, value: unknown) => {
        store[key] = value
      },
    }
    setActivePinia(createPinia())
  })

  it('toggles favorites and persists them', () => {
    const favorites = useFavoritesStore()
    favorites.toggle('qr-code')
    expect(favorites.isFavorite('qr-code')).toBe(true)

    setActivePinia(createPinia())
    const reloaded = useFavoritesStore()
    expect(reloaded.isFavorite('qr-code')).toBe(true)

    reloaded.toggle('qr-code')
    expect(reloaded.isFavorite('qr-code')).toBe(false)
  })
})