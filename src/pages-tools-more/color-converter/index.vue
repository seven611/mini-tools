<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { hslToRgb, parseHex, rgbToHex, rgbToHsl, type HSL, type RGB } from '@/core/color/color'
import { useHistoryStore } from '@/stores/history'
import { useDebounceFn } from '@/composables/use-debounce'
import { useToolShare } from '@/composables/use-tool-share'

const TOOL_ID = 'color-converter'
useToolShare(TOOL_ID)
const history = useHistoryStore()

const rgb = ref<RGB>({ r: 33, g: 181, b: 115 })
const hexText = ref('#21b573')

const PRESETS = ['#21b573', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#1f2329', '#ffffff']

const hexOut = computed(() => rgbToHex(rgb.value))
const hsl = computed(() => rgbToHsl(rgb.value))
const rgbStr = computed(() => `rgb(${rgb.value.r}, ${rgb.value.g}, ${rgb.value.b})`)
const hslStr = computed(() => `hsl(${hsl.value.h}, ${hsl.value.s}%, ${hsl.value.l}%)`)
const onColor = computed(() => {
  const { r, g, b } = rgb.value
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#1f2329' : '#ffffff'
})

function applyRgb(next: RGB) {
  rgb.value = next
  hexText.value = rgbToHex(next)
}
function onHexInput(v: string) {
  hexText.value = v
  const parsed = parseHex(v)
  if (parsed) rgb.value = parsed
}
function onRgbInput(ch: keyof RGB, v: string) {
  const n = Math.max(0, Math.min(255, Math.round(Number(v) || 0)))
  applyRgb({ ...rgb.value, [ch]: n })
}
function onHslChange(ch: keyof HSL, v: number) {
  applyRgb(hslToRgb({ ...hsl.value, [ch]: v }))
}
function pick(hex: string) {
  const parsed = parseHex(hex)
  if (parsed) applyRgb(parsed)
}

const saveSnapshot = useDebounceFn(() => {
  history.saveSnapshot(TOOL_ID, { rgb: rgb.value })
}, 400)
watch(rgb, saveSnapshot)

onLoad((options) => {
  history.record(TOOL_ID)
  if (options?.restore === '1') {
    const s = history.getSnapshot(TOOL_ID)
    if (s?.rgb) applyRgb(s.rgb as RGB)
  }
})
</script>

<template>
  <tool-page>
    <view class="card">
      <view class="card-title">选色 · 实时预览</view>
      <view class="swatch" :style="{ backgroundColor: hexOut }">
        <text class="swatch-hex" :style="{ color: onColor }">{{ hexOut }}</text>
      </view>

      <view class="presets">
        <view v-for="p in PRESETS" :key="p" class="preset" :class="{ on: hexOut === p }"
          :style="{ backgroundColor: p }" @click="pick(p)" />
      </view>

      <view class="slider-row" v-for="row in ([
        { ch: 'h', label: 'H', max: 360, val: hsl.h },
        { ch: 's', label: 'S', max: 100, val: hsl.s },
        { ch: 'l', label: 'L', max: 100, val: hsl.l },
      ] as const)" :key="row.ch">
        <text class="ch">{{ row.label }}</text>
        <slider :value="row.val" :min="0" :max="row.max" :block-size="20" activeColor="#21b573"
          @change="onHslChange(row.ch, Number(($event as any).detail.value))" />
        <text class="val">{{ row.val }}</text>
      </view>
    </view>

    <view class="card">
      <view class="card-title">输入色值 → 显色</view>
      <view class="field-label">HEX</view>
      <input :value="hexText" class="input" placeholder="#21b573" @input="onHexInput(($event as any).detail.value)">
      <view class="field-label gap">RGB</view>
      <view class="rgb-row">
        <input v-for="ch in (['r', 'g', 'b'] as const)" :key="ch" :value="rgb[ch]" class="input rgb" type="number"
          :placeholder="ch.toUpperCase()" @input="onRgbInput(ch, ($event as any).detail.value)">
      </view>
    </view>

    <view class="card">
      <view class="card-title">色值结果</view>
      <result-row label="HEX" :value="hexOut" />
      <result-row label="RGB" :value="rgbStr" />
      <result-row label="HSL" :value="hslStr" />
    </view>
  </tool-page>
</template>

<style lang="scss" scoped>
.gap { margin-top: 20rpx; }
.swatch {
  height: 200rpx;
  border-radius: 16rpx;
  border: 1rpx solid var(--border);
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 16rpx;
}
.swatch-hex { font-size: 28rpx; font-weight: 700; }
.presets {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 20rpx;
}
.preset {
  width: 64rpx;
  height: 64rpx;
  border-radius: 14rpx;
  border: 1rpx solid var(--border);
  &.on { outline: 4rpx solid var(--brand); outline-offset: 2rpx; }
}
.slider-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 16rpx;
  slider { flex: 1; }
  .ch { flex: 0 0 40rpx; font-size: 26rpx; color: var(--text-2); font-weight: 600; }
  .val { flex: 0 0 70rpx; text-align: right; font-size: 26rpx; }
}
.rgb-row { display: flex; gap: 16rpx; }
.rgb { flex: 1; text-align: center; }
</style>