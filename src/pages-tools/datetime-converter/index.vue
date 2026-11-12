<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { dateToTimestamp, formatDateTime, parseDateTime, timestampToDate } from '@/core/datetime/convert'
import { useHistoryStore } from '@/stores/history'
import { useDebounceFn } from '@/composables/use-debounce'
import { useToolShare } from '@/composables/use-tool-share'

const TOOL_ID = 'datetime-converter'
useToolShare(TOOL_ID)
const history = useHistoryStore()

const mode = ref<'ts-to-date' | 'date-to-ts'>('ts-to-date')
const tsInput = ref('')
const tsUnit = ref<'s' | 'ms'>('s')
const dateInput = ref('')

const parsedFromTs = computed(() => timestampToDate(tsInput.value, tsUnit.value))
const parsedFromDate = computed(() => parseDateTime(dateInput.value))

const tsInvalid = computed(() => tsInput.value.trim() !== '' && parsedFromTs.value === null)
const dateInvalid = computed(() => dateInput.value.trim() !== '' && parsedFromDate.value === null)

const localText = computed(() => parsedFromTs.value ? formatDateTime(parsedFromTs.value) : '')
const isoText = computed(() => parsedFromTs.value ? parsedFromTs.value.toISOString() : '')
const utcText = computed(() => parsedFromTs.value ? parsedFromTs.value.toUTCString() : '')
const secondsText = computed(() => parsedFromDate.value ? String(dateToTimestamp(parsedFromDate.value, 's')) : '')
const millisText = computed(() => parsedFromDate.value ? String(dateToTimestamp(parsedFromDate.value, 'ms')) : '')

function fillNow() {
  const now = new Date()
  if (mode.value === 'ts-to-date') {
    tsInput.value = String(dateToTimestamp(now, tsUnit.value))
  }
  else {
    dateInput.value = formatDateTime(now)
  }
}

const saveSnapshot = useDebounceFn(() => {
  history.saveSnapshot(TOOL_ID, {
    mode: mode.value, tsInput: tsInput.value, tsUnit: tsUnit.value, dateInput: dateInput.value,
  })
}, 400)
watch([mode, tsInput, tsUnit, dateInput], saveSnapshot)

onLoad((options) => {
  history.record(TOOL_ID)
  if (options?.restore === '1') {
    const s = history.getSnapshot(TOOL_ID)
    if (s) {
      mode.value = s.mode === 'date-to-ts' ? 'date-to-ts' : 'ts-to-date'
      tsInput.value = String(s.tsInput ?? '')
      tsUnit.value = s.tsUnit === 'ms' ? 'ms' : 's'
      dateInput.value = String(s.dateInput ?? '')
    }
  }
})
</script>

<template>
  <tool-page>
    <view class="tabs">
      <view class="tab" :class="{ active: mode === 'ts-to-date' }" @click="mode = 'ts-to-date'">
        时间戳 → 日期
      </view>
      <view class="tab" :class="{ active: mode === 'date-to-ts' }" @click="mode = 'date-to-ts'">
        日期 → 时间戳
      </view>
    </view>

    <template v-if="mode === 'ts-to-date'">
      <view class="card">
        <view class="row-between">
          <view class="card-title no-margin">Unix 时间戳</view>
          <view class="unit-toggle">
            <text :class="{ on: tsUnit === 's' }" @click="tsUnit = 's'">秒</text>
            <text :class="{ on: tsUnit === 'ms' }" @click="tsUnit = 'ms'">毫秒</text>
          </view>
        </view>
        <input v-model="tsInput" class="input" type="number" placeholder="如 1234567890">
        <view v-if="tsInvalid" class="error">时间戳格式不正确（秒 10 位 / 毫秒 13 位以内数字）</view>
        <view class="row actions">
          <button class="btn btn-plain btn-small" @click="fillNow">现在</button>
        </view>
      </view>

      <view class="card">
        <view class="card-title">转换结果</view>
        <result-row label="本地时间" :value="localText" />
        <result-row label="ISO 8601" :value="isoText" />
        <result-row label="UTC" :value="utcText" />
      </view>
    </template>

    <template v-else>
      <view class="card">
        <view class="card-title">日期时间</view>
        <input v-model="dateInput" class="input" placeholder="如 2009-02-13 23:31:30">
        <view v-if="dateInvalid" class="error">无法识别的日期格式</view>
        <view class="row actions">
          <button class="btn btn-plain btn-small" @click="fillNow">现在</button>
        </view>
        <view class="muted hint">支持 ISO 8601、YYYY-MM-DD HH:mm:ss、时间戳、Excel 序列号等。</view>
      </view>

      <view class="card">
        <view class="card-title">转换结果</view>
        <result-row label="秒 (s)" :value="secondsText" />
        <result-row label="毫秒 (ms)" :value="millisText" />
      </view>
    </template>
  </tool-page>
</template>

<style lang="scss" scoped>
.tabs {
  display: flex;
  background-color: var(--card);
  border-radius: 16rpx;
  padding: 8rpx;
  margin-bottom: 24rpx;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  font-size: 26rpx;
  color: var(--text-2);
  border-radius: 12rpx;

  &.active {
    background-color: var(--brand-soft);
    color: var(--brand);
    font-weight: 600;
  }
}

.no-margin {
  margin-bottom: 0;
}

.unit-toggle {
  display: flex;
  gap: 8rpx;

  text {
    padding: 6rpx 20rpx;
    border-radius: 10rpx;
    font-size: 24rpx;
    color: var(--text-3);
    background-color: var(--bg);

    &.on {
      color: var(--brand);
      background-color: var(--brand-soft);
      font-weight: 600;
    }
  }
}

.input {
  margin-top: 16rpx;
}

.error {
  color: var(--danger);
  font-size: 24rpx;
  margin-top: 12rpx;
}

.actions {
  margin-top: 16rpx;
}

.hint {
  margin-top: 12rpx;
  line-height: 1.6;
}
</style>