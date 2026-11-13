import { describe, expect, it } from 'vitest'
import { base64Decode, base64Encode } from '@/core/text/base64'

describe('base64Encode', () => {
  it('ASCII 标准向量', () => {
    expect(base64Encode('hello')).toBe('aGVsbG8=')
    expect(base64Encode('')).toBe('')
  })

  it('中文 UTF-8', () => {
    expect(base64Encode('中文')).toBe('5Lit5paH')
  })

  it('emoji 四字节 UTF-8', () => {
    expect(base64Encode('😀')).toBe('8J+YgA==')
  })
})

describe('base64Decode', () => {
  it('标准向量还原', () => {
    expect(base64Decode('aGVsbG8=')).toBe('hello')
    expect(base64Decode('5Lit5paH')).toBe('中文')
    expect(base64Decode('8J+YgA==')).toBe('😀')
    expect(base64Decode('')).toBe('')
  })

  it('非法输入返回 null', () => {
    expect(base64Decode('!!!')).toBeNull()
    expect(base64Decode('aGVsbG8')).toBeNull()
    expect(base64Decode('a')).toBeNull()
  })

  it('往返一致', () => {
    const s = '随手口袋工具 pocket-tools 123'
    expect(base64Decode(base64Encode(s))).toBe(s)
  })
})