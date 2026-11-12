/*
 * Original for 随手口袋工具 (GPL-3.0). 平台适配层：本地存储。
 * 统一存 JSON 字符串，读取失败回退默认值，避免脏数据炸页面。
 */

export function readStorage<T>(key: string, fallback: T): T {
  const raw = uni.getStorageSync(key)
  if (typeof raw !== 'string' || raw === '') {
    return fallback
  }
  try {
    return JSON.parse(raw) as T
  }
  catch {
    return fallback
  }
}

export function writeStorage(key: string, value: unknown): void {
  uni.setStorageSync(key, JSON.stringify(value))
}