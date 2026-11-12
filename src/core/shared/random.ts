export type Rng = () => number

export function createSeededRng(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function createSecureRng(bytes: Uint8Array): Rng {
  let offset = 0
  return () => {
    if (offset + 4 > bytes.length) {
      throw new Error('random bytes exhausted')
    }
    const value = new DataView(bytes.buffer, bytes.byteOffset + offset, 4).getUint32(0, true)
    offset += 4
    return value / 4294967296
  }
}