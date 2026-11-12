/*
 * Original for 随手口袋工具 (GPL-3.0).
 * 人民币金额转中文大写（财务规范：壹贰叁…、拾佰仟万亿、整/角/分）。
 * 字符串十进制四舍五入到分，避免浮点误差；纯本地计算。
 */

const DIGITS = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
const SECTION_UNITS = ['仟', '佰', '拾', '']
const BIG_UNITS = ['', '万', '亿', '万亿']
const MAX_INT_DIGITS = 16

function incrementDigits(digits: string): { digits: string; carry: boolean } {
  const arr = digits.split('')
  let i = arr.length - 1
  while (i >= 0 && arr[i] === '9') {
    arr[i] = '0'
    i--
  }
  if (i < 0) {
    return { digits: arr.join(''), carry: true }
  }
  arr[i] = String(Number(arr[i]) + 1)
  return { digits: arr.join(''), carry: false }
}

function sectionToChinese(section: number): string {
  const digits = [
    Math.floor(section / 1000) % 10,
    Math.floor(section / 100) % 10,
    Math.floor(section / 10) % 10,
    section % 10,
  ]
  let out = ''
  let zeroPending = false
  for (let i = 0; i < 4; i++) {
    const digit = digits[i]
    if (digit === 0) {
      if (out !== '') {
        zeroPending = true
      }
      continue
    }
    if (zeroPending) {
      out += '零'
      zeroPending = false
    }
    out += DIGITS[digit] + SECTION_UNITS[i]
  }
  return out
}

function intToChinese(intPart: string): string {
  const sections: number[] = []
  let rest = intPart
  while (rest.length > 0) {
    sections.unshift(Number(rest.slice(-4)))
    rest = rest.slice(0, -4)
  }

  let out = ''
  let zeroPending = false
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]
    const unit = BIG_UNITS[sections.length - 1 - i]
    if (section === 0) {
      zeroPending = out !== ''
      continue
    }
    if (zeroPending || (out !== '' && section < 1000)) {
      out += '零'
    }
    out += sectionToChinese(section) + unit
    zeroPending = false
  }
  return out
}

export function rmbToUppercase(value: number | string): string | null {
  const text = typeof value === 'number'
    ? (Number.isFinite(value) ? String(value) : '')
    : value.trim()

  const match = /^(-?)(\d+)(?:\.(\d+))?$/.exec(text)
  if (!match) {
    return null
  }

  const negative = match[1] === '-'
  let intPart = match[2].replace(/^0+(?=\d)/, '')
  const rawDec = match[3] ?? ''

  let decPart = rawDec.slice(0, 2).padEnd(2, '0')
  if (rawDec.length > 2 && rawDec[2] >= '5') {
    const rounded = incrementDigits(decPart)
    decPart = rounded.digits
    if (rounded.carry) {
      const bumped = incrementDigits(intPart)
      intPart = bumped.carry ? `1${bumped.digits}` : bumped.digits
    }
  }

  if (intPart.length > MAX_INT_DIGITS) {
    return null
  }

  const jiao = Number(decPart[0])
  const fen = Number(decPart[1])

  let decText = ''
  if (jiao > 0) {
    decText += DIGITS[jiao] + '角'
  }
  if (fen > 0) {
    if (jiao === 0 && intPart !== '0') {
      decText += '零'
    }
    decText += DIGITS[fen] + '分'
  }

  const isZero = intPart === '0' && decText === ''
  const intText = intPart === '0' ? '' : intToChinese(intPart)

  let result: string
  if (decText === '') {
    result = `${intText || '零'}元整`
  }
  else {
    result = (intPart !== '0' ? `${intText}元` : '') + decText
  }

  if (negative && !isZero) {
    result = `负${result}`
  }
  return result
}