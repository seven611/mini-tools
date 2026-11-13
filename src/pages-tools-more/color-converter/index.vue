<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { hslToRgb, parseHex, rgbToHex, rgbToHsl, type RGB } from '@/core/color/color'
import { useHistoryStore } from '@/stores/history'
import { useDebounceFn } from '@/composables/use-debounce'
import { useToolShare } from '@/composables/use-tool-share'

const TOOL_ID = 'color-converter'
useToolShare(TOOL_ID)
const history = useHistoryStore()

const rgb = ref<RGB>({ r: 33, g: 181, b: 115 })
const hexText = ref('#21b573')

const hexOut = computed(() => rgbToHex(rgb.value))
const hsl = computed(() => rgbToHsl(rgb.value))
const rgbStr = computed(() => `rgb(${rgb.value.r}, ${rgb.value.g}, ${rgb.value.b})`)
const hslStr = computed(() => `hsl(${hsl.value.h}, ${hsl.value.s}%, ${hsl.value.l}%)`)

function onHexInput(v: string) {
  hexText.value = v
  const parsed = parseHex(v)
  if (parsed) rgb.value = parsed
}
function setChannel(ch: keyof RGB, v: number) {
  rgb.value = { ...rgb.value, [ch]: v }
  hexText.value = rgbToHex(rgb.value)
}

const saveSnapshot = useDebounceFn(() => {
  history.saveSnapshot(TOOL_ID, { rgb: rgb.value })
}, 400)
watch(rgb, saveSnapshot)

onLoad((options) => {
  history.record(TOOL_ID)
  if (options?.restore === '1') {
    const s = history.getSnapshot(TOOL_ID)
    if (s?.rgb) {
      rgb.value = s.rgb as RGB
      hexText.value = rgbToHex(rgb.value)
    }
  }
})
</script>

<template>
  <tool-page>
    <view class="card">
      <view class="card-title">颜色预览</view>
      <view class="swatch" :style="{ backgroundColor: hexOut }" />
      <view class="field-label gap">HEX 色值</view>
      <input :value="hexText" class="input" placeholder="#21b573" @input="onHexInput(($event as any).detail.value)">
      <view class="slider-row gap" v-for="ch in (['r', 'g', 'b'] as const)" :key="ch">
        <text class="ch">{{ ch.toUpperCase() }}</text>
        <slider :value="rgb[ch]" :min="0" :max="255" :block-size="20" activeColor="#21b573"
          @change="setChannel(ch, Number(($event as any).detail.value))" />
        <text class="val">{{ rgb[ch] }}</text>
      </view>
    </view>

    <view class="card">
      <view class="card-title">转换结果</view>
      <result-row label="HEX" :value="hexOut" />
      <result-row label="RGB" :value="rgbStr" />
      <result-row label="HSL" :value="hslStr" />
    </view>
  </tool-page>
</template>

<style lang="scss" scoped>
.gap { margin-top: 20rpx; }
.swatch {
  height: 160rpx;
  border-radius: 16rpx;
  border: 1rpx solid var(--border);
}
.slider-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  slider { flex: 1; }
  .ch { flex: 0 0 40rpx; font-size: 26rpx; color: var(--text-2); font-weight: 600; }
  .val { flex: 0 0 70rpx; text-align: right; font-size: 26rpx; }
}
</style>