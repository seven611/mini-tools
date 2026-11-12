/*
 * Original for 随手口袋工具 (GPL-3.0). 最近使用历史（上限 50，含输入快照可恢复）。
 */

import { defineStore } from 'pinia'
import { readStorage, writeStorage } from '@/adapters/storage'

export interface HistoryEntry {
  id: string
  ts: number
  snapshot?: Record<string, unknown>
}

const KEY = 'ittools:history'
const MAX_ENTRIES = 50

export const useHistoryStore = defineStore('history', {
  state: () => ({
    entries: readStorage<HistoryEntry[]>(KEY, []),
  }),
  getters: {
    recent: state => state.entries.slice(0, 8),
  },
  actions: {
    record(id: string) {
      const prev = this.entries.find(entry => entry.id === id)
      const rest = this.entries.filter(entry => entry.id !== id)
      this.entries = [{ id, ts: Date.now(), snapshot: prev?.snapshot }, ...rest].slice(0, MAX_ENTRIES)
      this.persist()
    },
    saveSnapshot(id: string, snapshot: Record<string, unknown>) {
      const entry = this.entries.find(item => item.id === id)
      if (entry) {
        entry.snapshot = snapshot
        this.persist()
      }
    },
    getSnapshot(id: string): Record<string, unknown> | undefined {
      return this.entries.find(entry => entry.id === id)?.snapshot
    },
    persist() {
      writeStorage(KEY, this.entries)
    },
  },
})