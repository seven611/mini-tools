/*
 * Original for 随手口袋工具 (GPL-3.0). 收藏的工具 id 列表。
 */

import { defineStore } from 'pinia'
import { readStorage, writeStorage } from '@/adapters/storage'

const KEY = 'ittools:favorites'

export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    ids: readStorage<string[]>(KEY, []),
  }),
  actions: {
    isFavorite(id: string): boolean {
      return this.ids.includes(id)
    },
    toggle(id: string) {
      this.ids = this.ids.includes(id)
        ? this.ids.filter(item => item !== id)
        : [...this.ids, id]
      writeStorage(KEY, this.ids)
    },
  },
})