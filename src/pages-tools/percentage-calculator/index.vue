<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { percentChange, percentOf, whatPercent } from '@/core/math/percentage'
import { formatNumber, parseNumber } from '@/core/shared/format'
import { useHistoryStore } from '@/stores/history'
import { useDebounceFn } from '@/composables/use-debounce'
import { useToolShare } from '@/composables/use-tool-share'

const TOOL_ID = 'percentage-calculator'
useToolShare(TOOL_ID)
const history = useHistoryStore()

const x1 = ref('')
const y1 = ref('')
const x2 = ref('')
const y2 = ref('')
const from = ref('')
const to = ref('')

const result1 = computed(() => {
  const x = parseNumber(x1.value)
  const y = parseNumber(y1.value)
  return x == null || y == null ? '' : formatNumber(percentOf(x, y))
})
const result2 = computed(() => {
  const x = parseNumber(x2.value)
  const y = parseNumber(y2.value)
  return x == null || y == null ? '' : formatNumber(whatPercent(x, y))
})
const result3 = computed(() => {
  const f = parseNumber(from.value)
  const t = parseNumber(to.value)
  return f == null || t == null ? '' : formatNumber(percentChange(f, t))
})

const saveSnapshot = useDebounceFn(() => {
  history.saveSnapshot(TOOL_ID, {
    x1: x1.value, y1: y1.value, x2: x2.value, y2: y2.value, from: from.value, to: to.value,
  })
}, 400)
watch([x1, y1, x2, y2, from, to], saveSnapshot)

onLoad((options) => {
  history.record(TOOL_ID)
  if (options?.restore === '1') {
    const s = history.getSnapshot(TOOL_ID)
    if (s) {
      x1.value = String(s.x1 ?? '')
      y1.value = String(s.y1 ?? '')
      x2.value = String(s.x2 ?? '')
      y2.value = String(s.y2 ?? '')
      from.value = String(s.from ?? '')
      to.value = String(s.to ?? '')
    }
  }
})
</script>

<template>
  <tool-page>
    <view class="card">
      <view class="card-title">Y 的 X% 是多少</view>
      <view class="row">
        <input v-model="x1" class="input" type="digit" placeholder="X">
        <view class="unit">% of</view>
        <input v-model="y1" class="input" type="digit" placeholder="Y">
      </view>
      <result-row label="结果" :value="result1" />
    </view>

    <view class="card">
      <view class="card-title">X 是 Y 的百分之几</view>
      <view class="row">
        <input v-model="x2" class="input" type="digit" placeholder="X">
        <view class="unit">/</view>
        <input v-model="y2" class="input" type="digit" placeholder="Y">
      </view>
      <result-row label="结果 (%)" :value="result2" />
    </view>

    <view class="card">
      <view class="card-title">涨跌幅（From → To）</view>
      <view class="row">
        <input v-model="from" class="input" type="digit" placeholder="From">
        <view class="unit">→</view>
        <input v-model="to" class="input" type="digit" placeholder="To">
      </view>
      <result-row label="涨跌 (%)" :value="result3" />
    </view>
  </tool-page>
</template>

<style lang="scss" scoped>
.unit {
  flex-shrink: 0;
  color: var(--text-2);
  font-size: 26rpx;
}
</style>