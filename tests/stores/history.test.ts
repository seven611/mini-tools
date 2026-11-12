import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useHistoryStore } from '@/stores/history'

describe('history store', () => {
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

  it('records most recent first and upserts on repeat', () => {
    const history = useHistoryStore()
    history.record('a')
    history.record('b')
    history.record('a')
    expect(history.entries.map(e => e.id)).toEqual(['a', 'b'])
  })

  it('caps entries at 50', () => {
    const history = useHistoryStore()
    for (let i = 0; i < 60; i++) {
      history.record(`tool-${i}`)
    }
    expect(history.entries).toHaveLength(50)
    expect(history.entries[0].id).toBe('tool-59')
  })

  it('keeps and restores input snapshots', () => {
    const history = useHistoryStore()
    history.record('qr-code')
    history.saveSnapshot('qr-code', { text: 'hello' })
    expect(history.getSnapshot('qr-code')).toEqual({ text: 'hello' })

    setActivePinia(createPinia())
    const reloaded = useHistoryStore()
    expect(reloaded.getSnapshot('qr-code')).toEqual({ text: 'hello' })
  })

  it('preserves snapshot when re-recording the same tool', () => {
    const history = useHistoryStore()
    history.record('qr-code')
    history.saveSnapshot('qr-code', { text: 'hello' })
    history.record('qr-code')
    expect(history.getSnapshot('qr-code')).toEqual({ text: 'hello' })
  })
})