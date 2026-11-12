/*
 * Ported from it-tools (https://github.com/CorentinTh/it-tools), Copyright Corentin Thomasset, GPL-3.0.
 * Modified for 随手口袋工具: 修复上游字母表缺 N/n 的 bug；随机源改为可注入（默认 Math.random，
 * 小程序端注入 wx.getRandomValues 安全随机）；生成算法改为直接采样。详见 UPSTREAM.md。
 */
import type { Rng } from '@/core/shared/random'

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const NUMBERS = '0123456789'
const SYMBOLS = '.,;:!?./-"\'#{([-|\\@)]=}*+'

export interface TokenOptions {
  withUppercase?: boolean
  withLowercase?: boolean
  withNumbers?: boolean
  withSymbols?: boolean
  length?: number
  alphabet?: string
  rng?: Rng
}

export function createToken({
  withUppercase = true,
  withLowercase = true,
  withNumbers = true,
  withSymbols = false,
  length = 64,
  alphabet,
  rng = Math.random,
}: TokenOptions = {}): string {
  const allAlphabet = alphabet ?? [
    withUppercase ? UPPERCASE : '',
    withLowercase ? LOWERCASE : '',
    withNumbers ? NUMBERS : '',
    withSymbols ? SYMBOLS : '',
  ].join('')

  if (!allAlphabet || length <= 0) {
    return ''
  }

  let token = ''
  for (let i = 0; i < length; i++) {
    token += allAlphabet[Math.floor(rng() * allAlphabet.length)]
  }
  return token
}