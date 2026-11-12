/*
 * Ported from it-tools (https://github.com/CorentinTh/it-tools), Copyright Corentin Thomasset, GPL-3.0.
 * Modified for 随手口袋工具: 去除 lodash 依赖改为原生实现；时长文案中文化。详见 UPSTREAM.md。
 */

export { getPasswordCrackTimeEstimation, getCharsetLength }

function prettifyExponentialNotation(exponentialNotation: number) {
  const [base, exponent] = exponentialNotation.toString().split('e')
  const baseAsNumber = Number.parseFloat(base)
  const prettyBase = baseAsNumber % 1 === 0 ? baseAsNumber.toLocaleString() : baseAsNumber.toFixed(2)
  return exponent ? `${prettyBase}e${exponent}` : prettyBase
}

function getHumanFriendlyDuration({ seconds }: { seconds: number }) {
  if (seconds <= 0.001) {
    return '瞬间'
  }
  if (seconds <= 1) {
    return '不到 1 秒'
  }

  const timeUnits = [
    { unit: '千年', secondsInUnit: 31536000000, format: prettifyExponentialNotation },
    { unit: '世纪', secondsInUnit: 3153600000 },
    { unit: '十年', secondsInUnit: 315360000 },
    { unit: '年', secondsInUnit: 31536000 },
    { unit: '个月', secondsInUnit: 2592000 },
    { unit: '周', secondsInUnit: 604800 },
    { unit: '天', secondsInUnit: 86400 },
    { unit: '小时', secondsInUnit: 3600 },
    { unit: '分钟', secondsInUnit: 60 },
    { unit: '秒', secondsInUnit: 1 },
  ]

  const parts: string[] = []
  for (const { unit, secondsInUnit, format = (n: number) => String(n) } of timeUnits) {
    const quantity = Math.floor(seconds / secondsInUnit)
    seconds %= secondsInUnit
    if (quantity > 0) {
      parts.push(`${format(quantity)} ${unit}`)
    }
    if (parts.length === 2) {
      break
    }
  }
  return parts.join('，')
}

function getPasswordCrackTimeEstimation({ password, guessesPerSecond = 1e9 }: { password: string, guessesPerSecond?: number }) {
  const charsetLength = getCharsetLength({ password })
  const passwordLength = password.length

  const entropy = password === '' ? 0 : Math.log2(charsetLength) * passwordLength
  // 用 charset^length 而非 2^entropy，避免 log2/exp2 往返的浮点误差
  const secondsToCrack = charsetLength ** passwordLength / guessesPerSecond
  const crackDurationFormatted = getHumanFriendlyDuration({ seconds: secondsToCrack })
  const score = Math.min(entropy / 128, 1)

  return { entropy, charsetLength, passwordLength, crackDurationFormatted, secondsToCrack, score }
}

function getCharsetLength({ password }: { password: string }) {
  let charsetLength = 0
  if (/[a-z]/.test(password)) {
    charsetLength += 26
  }
  if (/[A-Z]/.test(password)) {
    charsetLength += 26
  }
  if (/\d/.test(password)) {
    charsetLength += 10
  }
  if (/\W|_/.test(password)) {
    charsetLength += 32
  }
  return charsetLength
}