import { describe, expect, it } from 'vitest'
import { formatBytes, savingsPercent, targetSize } from '@/core/image/compress'

describe('targetSize', () => {
  it('不放大：maxEdge 大于原图返回原尺寸', () => {
    expect(targetSize(1000, 500, 2000)).toEqual({ width: 1000, height: 500 })
  })
  it('等比缩小到长边', () => {
    expect(targetSize(4000, 3000, 1000)).toEqual({ width: 1000, height: 750 })
  })
  it('maxEdge 为 0 表示原图', () => {
    expect(targetSize(800, 600, 0)).toEqual({ width: 800, height: 600 })
  })
  it('正方形', () => {
    expect(targetSize(2000, 2000, 500)).toEqual({ width: 500, height: 500 })
  })
})

describe('formatBytes', () => {
  it('单位换算', () => {
    expect(formatBytes(0)).toBe('0 B')
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(1024)).toBe('1 KB')
    expect(formatBytes(1536)).toBe('1.5 KB')
    expect(formatBytes(1048576)).toBe('1 MB')
    expect(formatBytes(2.5 * 1048576)).toBe('2.5 MB')
  })
})

describe('savingsPercent', () => {
  it('计算节省比例', () => {
    expect(savingsPercent(1000, 250)).toBe(75)
    expect(savingsPercent(1000, 1000)).toBe(0)
  })
  it('原大小为 0 返回 0', () => {
    expect(savingsPercent(0, 0)).toBe(0)
  })
  it('压缩后更大不返回负数', () => {
    expect(savingsPercent(100, 200)).toBe(0)
  })
})