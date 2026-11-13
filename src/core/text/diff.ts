/*
 * Original for 随手口袋工具 (GPL-3.0). 文本对比：LCS 行级 diff，超大输入退化为整段增删。
 */

export interface DiffLine {
  type: 'same' | 'add' | 'del'
  text: string
}

export function diffLines(a: string, b: string): DiffLine[] {
  const A = a === '' ? [] : a.split('\n')
  const B = b === '' ? [] : b.split('\n')
  const n = A.length
  const m = B.length
  if (n === 0 && m === 0) return []
  if (n * m > 4000000) {
    return [
      ...A.map(text => ({ type: 'del' as const, text })),
      ...B.map(text => ({ type: 'add' as const, text })),
    ]
  }

  const W = m + 1
  const dp = new Uint32Array((n + 1) * W)
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i * W + j] = A[i] === B[j]
        ? dp[(i + 1) * W + j + 1] + 1
        : Math.max(dp[(i + 1) * W + j], dp[i * W + j + 1])
    }
  }

  const out: DiffLine[] = []
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (A[i] === B[j]) {
      out.push({ type: 'same', text: A[i] })
      i++
      j++
    }
    else if (dp[(i + 1) * W + j] >= dp[i * W + j + 1]) {
      out.push({ type: 'del', text: A[i] })
      i++
    }
    else {
      out.push({ type: 'add', text: B[j] })
      j++
    }
  }
  while (i < n) out.push({ type: 'del', text: A[i++] })
  while (j < m) out.push({ type: 'add', text: B[j++] })
  return out
}