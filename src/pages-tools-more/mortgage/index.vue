<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { equalInstallment, equalPrincipal } from '@/core/mortgage/mortgage'
import { parseNumber } from '@/core/shared/format'
import { useHistoryStore } from '@/stores/history'
import { useDebounceFn } from '@/composables/use-debounce'
import { useToolShare } from '@/composables/use-tool-share'

const TOOL_ID = 'mortgage'
useToolShare(TOOL_ID)
const history = useHistoryStore()

const principalWan = ref('100')
const rate = ref('3.6')
const yearIndex = ref(29)
const mode = ref<'installment' | 'principal'>('installment')
const showSchedule = ref(false)

const yearLabels = Array.from({ length: 30 }, (_, i) => `${i + 1} 年`)

const result = computed(() => {
  const p = parseNumber(principalWan.value)
  const r = parseNumber(rate.value)
  if (p == null || r == null) return null
  const input = { principal: p * 10000, years: yearIndex.value + 1, annualRatePercent: r }
  return mode.value === 'installment' ? equalInstallment(input) : equalPrincipal(input)
})

const fmt = (n: number) => n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const saveSnapshot = useDebounceFn(() => {
  history.saveSnapshot(TOOL_ID, { principalWan: principalWan.value, rate: rate.value, yearIndex: yearIndex.value, mode: mode.value })
}, 400)
watch([principalWan, rate, yearIndex, mode], saveSnapshot)

onLoad((options) => {
  history.record(TOOL_ID)
  if (options?.restore === '1') {
    const s = history.getSnapshot(TOOL_ID)
    if (s) {
      principalWan.value = String(s.principalWan ?? '100')
      rate.value = String(s.rate ?? '3.6')
      yearIndex.value = Number(s.yearIndex ?? 29)
      mode.value = s.mode === 'principal' ? 'principal' : 'installment'
    }
  }
})
</script>

<template>
  <tool-page>
    <view class="card">
      <view class="card-title">贷款条件</view>
      <view class="field-label">贷款总额（万元）</view>
      <input v-model="principalWan" class="input" type="digit" placeholder="如 100">
      <view class="field-label gap">年利率（%）</view>
      <input v-model="rate" class="input" type="digit" placeholder="如 3.6">
      <view class="field-label gap">贷款年限</view>
      <picker mode="selector" :range="yearLabels" :value="yearIndex" @change="yearIndex = Number($event.detail.value)">
        <view class="picker-box">{{ yearLabels[yearIndex] }} ▾</view>
      </picker>
      <view class="mode-toggle gap">
        <text :class="{ on: mode === 'installment' }" @click="mode = 'installment'">等额本息</text>
        <text :class="{ on: mode === 'principal' }" @click="mode = 'principal'">等额本金</text>
      </view>
    </view>

    <view class="card">
      <view class="card-title">计算结果</view>
      <template v-if="result">
        <result-row :label="mode === 'installment' ? '每月月供' : '首月月供'" :value="fmt(result.monthly)" />
        <result-row label="总利息" :value="fmt(result.totalInterest)" />
        <result-row label="还款总额" :value="fmt(result.totalPayment)" />
        <view v-if="mode === 'principal'" class="muted gap">等额本金月供逐月递减，末月 {{ fmt(result.schedule[result.schedule.length - 1].payment) }} 元。</view>
        <button class="btn btn-plain btn-small gap" @click="showSchedule = !showSchedule">
          {{ showSchedule ? '收起明细' : '查看逐月明细' }}
        </button>
        <scroll-view v-if="showSchedule" scroll-y class="schedule">
          <view v-for="m in result.schedule" :key="m.month" class="schedule-row">
            <text class="m">第{{ m.month }}月</text>
            <text>月供 {{ fmt(m.payment) }}</text>
            <text class="muted">息 {{ fmt(m.interest) }}</text>
          </view>
        </scroll-view>
      </template>
      <view v-else class="muted">请输入有效的金额与利率。</view>
    </view>
  </tool-page>
</template>

<style lang="scss" scoped>
.gap { margin-top: 20rpx; }
.picker-box {
  background-color: var(--bg);
  border: 1rpx solid var(--border);
  border-radius: 12rpx;
  height: 84rpx;
  line-height: 84rpx;
  padding: 0 20rpx;
  font-size: 26rpx;
}
.mode-toggle {
  display: flex;
  gap: 8rpx;
  text {
    flex: 1;
    text-align: center;
    padding: 14rpx 0;
    border-radius: 12rpx;
    font-size: 26rpx;
    color: var(--text-2);
    background-color: var(--bg);
    &.on { color: var(--brand); background-color: var(--brand-soft); font-weight: 600; }
  }
}
.schedule {
  max-height: 600rpx;
  margin-top: 20rpx;
  border-top: 1rpx solid var(--border);
}
.schedule-row {
  display: flex;
  justify-content: space-between;
  gap: 12rpx;
  padding: 12rpx 0;
  font-size: 24rpx;
  border-bottom: 1rpx solid var(--border);
  .m { color: var(--text-2); flex: 0 0 120rpx; }
}
</style>