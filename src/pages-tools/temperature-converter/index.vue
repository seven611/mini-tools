<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { convertTemperature, TEMPERATURE_UNITS, type TemperatureUnit } from '@/core/math/temperature'
import { formatNumber, parseNumber } from '@/core/shared/format'
import { useHistoryStore } from '@/stores/history'
import { useDebounceFn } from '@/composables/use-debounce'
import { useToolShare } from '@/composables/use-tool-share'

const TOOL_ID = 'temperature-converter'
useToolShare(TOOL_ID)
const history = useHistoryStore()

const unitLabels = TEMPERATURE_UNITS.map(unit => unit.label)
const value = ref('')
const fromIndex = ref(0)
const toIndex = ref(1)

const fromUnit = computed<TemperatureUnit>(() => TEMPERATURE_UNITS[fromIndex.value].value)
const toUnit = computed<TemperatureUnit>(() => TEMPERATURE_UNITS[toIndex.value].value)

const result = computed(() => {
  const parsed = parseNumber(value.value)
  return parsed == null ? '' : formatNumber(convertTemperature(parsed, fromUnit.value, toUnit.value))
})

function swap() {
  const temp = fromIndex.value
  fromIndex.value = toIndex.value
  toIndex.value = temp
}

const saveSnapshot = useDebounceFn(() => {
  history.saveSnapshot(TOOL_ID, { value: value.value, from: fromIndex.value, to: toIndex.value })
}, 400)
watch([value, fromIndex, toIndex], saveSnapshot)

onLoad((options) => {
  history.record(TOOL_ID)
  if (options?.restore === '1') {
    const s = history.getSnapshot(TOOL_ID)
    if (s) {
      value.value = String(s.value ?? '')
      fromIndex.value = Number(s.from ?? 0)
      toIndex.value = Number(s.to ?? 1)
    }
  }
})
</script>

<template>
  <tool-page>
    <view class="card">
      <view class="card-title">温度换算</view>
      <input v-model="value" class="input" type="digit" placeholder="输入温度值">

      <view class="picker-row">
        <picker mode="selector" :range="unitLabels" :value="fromIndex" @change="fromIndex = Number($event.detail.value)">
          <view class="picker-box">{{ unitLabels[fromIndex] }} ▾</view>
        </picker>
        <view class="swap" @click="swap">⇄</view>
        <picker mode="selector" :range="unitLabels" :value="toIndex" @change="toIndex = Number($event.detail.value)">
          <view class="picker-box">{{ unitLabels[toIndex] }} ▾</view>
        </picker>
      </view>

      <result-row :label="unitLabels[toIndex]" :value="result" />
    </view>

    <view class="card">
      <view class="card-title">常用参考</view>
      <view class="muted">水的冰点：0 °C = 32 °F；烤箱常用 180 °C = 356 °F；体温 37 °C = 98.6 °F。</view>
    </view>
  </tool-page>
</template>

<style lang="scss" scoped>
.picker-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 20rpx;
}

.picker-box {
  background-color: var(--bg);
  border: 1rpx solid var(--border);
  border-radius: 12rpx;
  padding: 18rpx 20rpx;
  font-size: 26rpx;
  min-width: 220rpx;
  text-align: center;
}

.swap {
  flex-shrink: 0;
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--brand-soft);
  color: var(--brand);
  font-size: 32rpx;
}
</style>