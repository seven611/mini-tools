import { describe, expect, it } from 'vitest'
import { diffLines } from '@/core/text/diff'

describe('diffLines', () => {
  it('相同文本全部 same', () => {
    expect(diffLines('a\nb', 'a\nb')).toEqual([
      { type: 'same', text: 'a' },
      { type: 'same', text: 'b' },
    ])
  })

  it('中间替换：先 del 后 add', () => {
    expect(diffLines('a\nb\nc', 'a\nx\nc')).toEqual([
      { type: 'same', text: 'a' },
      { type: 'del', text: 'b' },
      { type: 'add', text: 'x' },
      { type: 'same', text: 'c' },
    ])
  })

  it('空文本边界', () => {
    expect(diffLines('', 'a\nb')).toEqual([
      { type: 'add', text: 'a' },
      { type: 'add', text: 'b' },
    ])
    expect(diffLines('a', '')).toEqual([{ type: 'del', text: 'a' }])
    expect(diffLines('', '')).toEqual([])
  })

  it('纯新增行', () => {
    expect(diffLines('a\nc', 'a\nb\nc')).toEqual([
      { type: 'same', text: 'a' },
      { type: 'add', text: 'b' },
      { type: 'same', text: 'c' },
    ])
  })
})