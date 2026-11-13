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
const drag = ref<'' | 'sv' | 'hue'>('')
function endDrag() { drag.value = '' }

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

function bindMouse(handler: (e: any) => void) {
  if (typeof window === 'undefined') return
  const move = (e: any) => handler(e)
  const up = () => {
    endDrag()
    window.removeEventListener('mousemove', move)
    window.removeEventListener('mouseup', up)
  }
  window.addEventListener('mousemove', move)
  window.addEventListener('mouseup', up)
}

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
function liveRect(id: string): UniApp.NodeInfo | null {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null
  const el = document.getElementById(id)
  return el ? (el.getBoundingClientRect() as unknown as UniApp.NodeInfo) : null
}
function svTouch(e: any) {
  const t = coord(e)
  const r = liveRect('sv') ?? svRect
  if (!r || !t) return
  drag.value = 'sv'
  const x = clamp(t.clientX - r.left!, 0, r.width!)
  const y = clamp(t.clientY - r.top!, 0, r.height!)
  applyHsv({ ...hsv.value, s: Math.round((x / r.width!) * 100), v: Math.round(100 - (y / r.height!) * 100) })
  if (e.type === 'mousedown') bindMouse(svTouch)
}
function hueTouch(e: any) {
  const t = coord(e)
  const r = liveRect('hue') ?? hueRect
  if (!r || !t) return
  drag.value = 'hue'
  const x = clamp(t.clientX - r.left!, 0, r.width!)
  applyHsv({ ...hsv.value, h: Math.round((x / r.width!) * 360) })
  if (e.type === 'mousedown') bindMouse(hueTouch)
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
        @touchstart="svTouch" @touchmove.stop.prevent="svTouch" @touchend="endDrag"
        @mousedown="svTouch" @mousemove="svTouch" @mouseup="endDrag" @mouseleave="endDrag">
        <view class="dot" :class="{ active: drag === 'sv' }" :style="{ left: hsv.s + '%', top: (100 - hsv.v) + '%' }" />
      </view>
      <view id="hue" class="hue" :style="{ background: hueBackground }"
        @touchstart="hueTouch" @touchmove.stop.prevent="hueTouch" @touchend="endDrag"
        @mousedown="hueTouch" @mousemove="hueTouch" @mouseup="endDrag" @mouseleave="endDrag">
        <view class="dot hue-dot" :class="{ active: drag === 'hue' }" :style="{ left: (hsv.h / 360 * 100) + '%' }" />
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
.sv { cursor: crosshair; }
.hue { cursor: pointer; }
.dot {
  position: absolute;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  border: 4rpx solid #ffffff;
  box-shadow: 0 0 6rpx rgba(0, 0, 0, 0.4);
  transform: translate(-50%, -50%);
  cursor: grab;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  &.active {
    cursor: grabbing;
    transform: translate(-50%, -50%) scale(1.25);
    box-shadow: 0 0 12rpx rgba(0, 0, 0, 0.55);
  }
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