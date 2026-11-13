<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { UNIT_CATEGORIES, convertUnit } from '@/core/units/units'
import { formatNumber, parseNumber } from '@/core/shared/format'
import { useHistoryStore } from '@/stores/history'
import { useDebounceFn } from '@/composables/use-debounce'
import { useToolShare } from '@/composables/use-tool-share'

const TOOL_ID = 'unit-converter'
useToolShare(TOOL_ID)
const history = useHistoryStore()

const catIndex = ref(0)
const value = ref('1')
const fromIndex = ref(2)
const toIndex = ref(3)

const category = computed(() => UNIT_CATEGORIES[catIndex.value])
const catLabels = UNIT_CATEGORIES.map(c => c.name)
const unitLabels = computed(() => category.value.units.map(u => u.name))

const result = computed(() => {
  const parsed = parseNumber(value.value)
  if (parsed == null) return ''
  const from = category.value.units[fromIndex.value]
  const to = category.value.units[toIndex.value]
  const r = convertUnit(category.value.id, from.id, to.id, parsed)
  return r == null ? '' : formatNumber(r)
})

function onCatChange(i: number) {
  catIndex.value = i
  fromIndex.value = 0
  toIndex.value = 1
}
function swap() {
  const t = fromIndex.value
  fromIndex.value = toIndex.value
  toIndex.value = t
}

const saveSnapshot = useDebounceFn(() => {
  history.saveSnapshot(TOOL_ID, { cat: catIndex.value, value: value.value, from: fromIndex.value, to: toIndex.value })
}, 400)
watch([catIndex, value, fromIndex, toIndex], saveSnapshot)

onLoad((options) => {
  history.record(TOOL_ID)
  if (options?.restore === '1') {
    const s = history.getSnapshot(TOOL_ID)
    if (s) {
      catIndex.value = Number(s.cat ?? 0)
      value.value = String(s.value ?? '1')
      fromIndex.value = Number(s.from ?? 0)
      toIndex.value = Number(s.to ?? 1)
    }
  }
})
</script>

<template>
  <tool-page>
    <view class="card">
      <view class="card-title">单位换算</view>
      <picker mode="selector" :range="catLabels" :value="catIndex" @change="onCatChange(Number($event.detail.value))">
        <view class="picker-box">{{ catLabels[catIndex] }} ▾</view>
      </picker>
      <input v-model="value" class="input gap" type="digit" placeholder="输入数值">
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
  text-align: center;
}
.picker-row { display: flex; align-items: center; gap: 16rpx; margin-top: 20rpx; }
.picker-row picker { flex: 1; }
.swap {
  flex-shrink: 0;
  width: 64rpx; height: 64rpx;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  background-color: var(--brand-soft); color: var(--brand); font-size: 32rpx;
}
</style>