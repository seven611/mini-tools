<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onLoad, onReady } from '@dcloudio/uni-app'
import { hsvToRgb, parseHex, rgbToHex, rgbToHsl, rgbToHsv, type HSV, type RGB } from '@/core/color/color'
import { useHistoryStore } from '@/stores/history'
import { useDebounceFn } from '@/composables/use-debounce'
import { useToolShare } from '@/composables/use-tool-share'

const TOOL_ID = 'color-converter'
useToolShare(TOOL_ID)
const history = useHistoryStore()

const rgb = ref<RGB>({ r: 33, g: 181, b: 115 })
const hexText = ref('#21b573')

const hsv = computed(() => rgbToHsv(rgb.value))
const hexOut = computed(() => rgbToHex(rgb.value))
const hslStr = computed(() => {
  const { h, s, l } = rgbToHsl(rgb.value)
  return `hsl(${h}, ${s}%, ${l}%)`
})
const rgbStr = computed(() => `rgb(${rgb.value.r}, ${rgb.value.g}, ${rgb.value.b})`)
const onColor = computed(() => {
  const { r, g, b } = rgb.value
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#1f2329' : '#ffffff'
})
const pureHue = computed(() => rgbToHex(hsvToRgb({ h: hsv.value.h, s: 100, v: 100 })))
const svBackground = computed(() =>
  `linear-gradient(to top, #000, rgba(0,0,0,0)), linear-gradient(to right, #fff, ${pureHue.value})`)
const hueBackground = 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)'

let svRect: UniApp.NodeInfo | null = null
let hueRect: UniApp.NodeInfo | null = null
onReady(() => {
  uni.createSelectorQuery().select('#sv').boundingClientRect(r => { svRect = r as UniApp.NodeInfo }).exec()
  uni.createSelectorQuery().select('#hue').boundingClientRect(r => { hueRect = r as UniApp.NodeInfo }).exec()
})

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))

function applyRgb(next: RGB) {
  rgb.value = next
  hexText.value = rgbToHex(next)
}
function applyHsv(next: HSV) {
  applyRgb(hsvToRgb(next))
}
function coord(e: any) {
  if (e.type === 'mousemove' && e.buttons !== 1) return null
  return e.touches?.[0] ?? e
}
function svTouch(e: any) {
  const t = coord(e)
  if (!svRect || !t) return
  const x = clamp(t.clientX - svRect.left!, 0, svRect.width!)
  const y = clamp(t.clientY - svRect.top!, 0, svRect.height!)
  applyHsv({ ...hsv.value, s: Math.round((x / svRect.width!) * 100), v: Math.round(100 - (y / svRect.height!) * 100) })
}
function hueTouch(e: any) {
  const t = coord(e)
  if (!hueRect || !t) return
  const x = clamp(t.clientX - hueRect.left!, 0, hueRect.width!)
  applyHsv({ ...hsv.value, h: Math.round((x / hueRect.width!) * 360) })
}
function onHexInput(v: string) {
  hexText.value = v
  const parsed = parseHex(v)
  if (parsed) rgb.value = parsed
}
function onRgbInput(ch: keyof RGB, v: string) {
  applyRgb({ ...rgb.value, [ch]: clamp(Math.round(Number(v) || 0), 0, 255) })
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
      <view class="card-title">渐变选色板</view>
      <view id="sv" class="sv" :style="{ background: svBackground }"
        @touchstart="svTouch" @touchmove.prevent="svTouch" @mousedown="svTouch" @mousemove="svTouch">
        <view class="dot" :style="{ left: hsv.s + '%', top: (100 - hsv.v) + '%' }" />
      </view>
      <view id="hue" class="hue" :style="{ background: hueBackground }"
        @touchstart="hueTouch" @touchmove.prevent="hueTouch" @mousedown="hueTouch" @mousemove="hueTouch">
        <view class="dot hue-dot" :style="{ left: (hsv.h / 360 * 100) + '%' }" />
      </view>
      <view class="preview" :style="{ backgroundColor: hexOut }">
        <text :style="{ color: onColor }">{{ hexOut }}</text>
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
.sv {
  position: relative;
  height: 320rpx;
  border-radius: 16rpx;
  border: 1rpx solid var(--border);
}
.hue {
  position: relative;
  height: 48rpx;
  border-radius: 24rpx;
  margin-top: 24rpx;
  border: 1rpx solid var(--border);
}
.dot {
  position: absolute;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  border: 4rpx solid #ffffff;
  box-shadow: 0 0 6rpx rgba(0, 0, 0, 0.4);
  transform: translate(-50%, -50%);
  pointer-events: none;
}
.hue-dot { top: 50%; }
.preview {
  margin-top: 24rpx;
  height: 96rpx;
  border-radius: 16rpx;
  border: 1rpx solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 700;
}
.rgb-row { display: flex; gap: 16rpx; }
.rgb { flex: 1; text-align: center; }
</style>