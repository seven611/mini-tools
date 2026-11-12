import { describe, expect, it } from 'vitest'
import { drawQrMatrix, type QrCanvasContext } from '@/core/qr/draw'
import { createQrMatrix } from '@/core/qr/matrix'

function createMockContext() {
  const calls: { fillStyle: string; rect: [number, number, number, number] }[] = []
  const ctx: QrCanvasContext = {
    fillStyle: '',
    fillRect(x, y, w, h) {
      calls.push({ fillStyle: ctx.fillStyle, rect: [x, y, w, h] })
    },
  }
  return { ctx, calls }
}

describe('drawQrMatrix (pure canvas drawing math)', () => {
  const matrix = createQrMatrix('hello')!

  it('paints the background over the full canvas first', () => {
    const { ctx, calls } = createMockContext()
    drawQrMatrix(ctx, matrix, 400)
    expect(calls[0]).toEqual({ fillStyle: '#ffffff', rect: [0, 0, 400, 400] })
  })

  it('paints one rect per dark module with a 4-module quiet zone', () => {
    const { ctx, calls } = createMockContext()
    drawQrMatrix(ctx, matrix, 400)
    const dark = calls.slice(1)
    const expectedDark = matrix.modules.flat().filter(Boolean).length
    expect(dark).toHaveLength(expectedDark)
    const cell = 400 / (matrix.size + 8)
    expect(dark[0].rect[0]).toBe(Math.round(4 * cell))
    expect(dark[0].rect[1]).toBe(Math.round(4 * cell))
    expect(dark.every(call => call.fillStyle === '#000000')).toBe(true)
  })

  it('honors custom colors and quiet zone', () => {
    const { ctx, calls } = createMockContext()
    drawQrMatrix(ctx, matrix, 300, { foreground: '#123456', background: '#eeeeee', quietZone: 2 })
    expect(calls[0].fillStyle).toBe('#eeeeee')
    const cell = 300 / (matrix.size + 4)
    expect(calls[1].rect[0]).toBe(Math.round(2 * cell))
    expect(calls[1].fillStyle).toBe('#123456')
  })

  it('covers the canvas without gaps between adjacent cells', () => {
    const { ctx, calls } = createMockContext()
    drawQrMatrix(ctx, matrix, 1080)
    const cell = 1080 / (matrix.size + 8)
    const first = calls[1].rect
    expect(first[2]).toBeGreaterThanOrEqual(Math.floor(cell))
    expect(first[0] + first[2]).toBe(Math.round(5 * cell))
  })
})