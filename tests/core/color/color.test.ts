import { describe, expect, it } from 'vitest'
import { hslToRgb, parseHex, rgbToHex, rgbToHsl } from '@/core/color/color'

describe('parseHex', () => {
  it('支持 #rgb 与 #rrggbb，大小写不敏感', () => {
    expect(parseHex('#ff0000')).toEqual({ r: 255, g: 0, b: 0 })
    expect(parseHex('#F00')).toEqual({ r: 255, g: 0, b: 0 })
    expect(parseHex('00FF00')).toEqual({ r: 0, g: 255, b: 0 })
  })

  it('非法输入返回 null', () => {
    expect(parseHex('#gg0000')).toBeNull()
    expect(parseHex('#12345')).toBeNull()
    expect(parseHex('')).toBeNull()
  })
})

describe('rgbToHex', () => {
  it('输出小写六位', () => {
    expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe('#ff0000')
    expect(rgbToHex({ r: 18, g: 52, b: 86 })).toBe('#123456')
  })
})

describe('rgbToHsl / hslToRgb', () => {
  it('三原色与灰阶', () => {
    expect(rgbToHsl({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, l: 50 })
    expect(rgbToHsl({ r: 0, g: 255, b: 0 })).toEqual({ h: 120, s: 100, l: 50 })
    expect(rgbToHsl({ r: 0, g: 0, b: 255 })).toEqual({ h: 240, s: 100, l: 50 })
    expect(rgbToHsl({ r: 255, g: 255, b: 255 })).toEqual({ h: 0, s: 0, l: 100 })
  })

  it('hslToRgb 反向还原', () => {
    expect(hslToRgb({ h: 0, s: 100, l: 50 })).toEqual({ r: 255, g: 0, b: 0 })
    expect(hslToRgb({ h: 120, s: 100, l: 50 })).toEqual({ r: 0, g: 255, b: 0 })
  })

  it('往返误差 ≤ 1', () => {
    for (const rgb of [{ r: 33, g: 181, b: 115 }, { r: 12, g: 34, b: 56 }, { r: 200, g: 160, b: 90 }]) {
      const back = hslToRgb(rgbToHsl(rgb))
      expect(Math.abs(back.r - rgb.r)).toBeLessThanOrEqual(1)
      expect(Math.abs(back.g - rgb.g)).toBeLessThanOrEqual(1)
      expect(Math.abs(back.b - rgb.b)).toBeLessThanOrEqual(1)
    }
  })
})