<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, ref, watch } from 'vue'
import { onLoad, onReady } from '@dcloudio/uni-app'
import { createQrMatrix, type ErrorCorrectionLevel } from '@/core/qr/matrix'
import { useQrCanvas } from '@/composables/use-qr-canvas'
import { useHistoryStore } from '@/stores/history'
import { useDebounceFn } from '@/composables/use-debounce'
import { usePremiumQuota } from '@/composables/use-premium-quota'
import { useToolShare } from '@/composables/use-tool-share'

const TOOL_ID = 'qr-code'
useToolShare(TOOL_ID)
const history = useHistoryStore()
const instance = getCurrentInstance()
const { drawPreview, exportPng, saveToAlbum } = useQrCanvas()

const text = ref('')
const foreground = ref('#000000')
const background = ref('#ffffff')
const level = ref<ErrorCorrectionLevel>('M')

const FOREGROUND_PRESETS = ['#000000', '#1f2329', '#21b573', '#3b82f6', '#dc2626']
const BACKGROUND_PRESETS = ['#ffffff', '#f6f7f9', '#fff7e6', '#e8f7ef']
const LEVELS: { value: ErrorCorrectionLevel; label: string }[] = [
  { value: 'L', label: 'L（7% 容错）' },
  { value: 'M', label: 'M（15% 容错）' },
  { value: 'Q', label: 'Q（25% 容错）' },
  { value: 'H', label: 'H（30% 容错）' },
]
const levelIndex = computed(() => LEVELS.findIndex(item => item.value === level.value))

const matrix = computed(() => createQrMatrix(text.value, level.value))
const { left, requestUse } = usePremiumQuota('qr-hd')
const hdLabel = computed(() =>
  left.value.free > 0 ? '高清无水印保存（今日免费 1 次）' : '高清无水印保存（看广告解锁）',
)

async function render() {
  if (!matrix.value) {
    return
  }
  await nextTick()
  try {
    await drawPreview('qr-preview', matrix.value, instance?.proxy, {
      foreground: foreground.value,
      background: background.value,
    })
  }
  catch {
    // canvas 节点尚未就绪时忽略，onReady 会补画
  }
}

watch([matrix, foreground, background], render)
onReady(render)

async function saveStandard() {
  if (!matrix.value) {
    return
  }
  const filePath = await exportPng(matrix.value, {
    size: 540,
    watermark: true,
    foreground: foreground.value,
    background: background.value,
  })
  await saveToAlbum(filePath)
}

async function saveHd() {
  if (!matrix.value) {
    return
  }
  const source = await requestUse()
  if (source === 'none') {
    uni.showToast({ title: '未解锁，明天再试', icon: 'none' })
    return
  }
  const filePath = await exportPng(matrix.value, {
    size: 1080,
    watermark: false,
    foreground: foreground.value,
    background: background.value,
  })
  await saveToAlbum(filePath)
}

const saveSnapshot = useDebounceFn(() => {
  history.saveSnapshot(TOOL_ID, {
    text: text.value, foreground: foreground.value, background: background.value, level: level.value,
  })
}, 400)
watch([text, foreground, background, level], saveSnapshot)

onLoad((options) => {
  history.record(TOOL_ID)
  if (options?.restore === '1') {
    const s = history.getSnapshot(TOOL_ID)
    if (s) {
      text.value = String(s.text ?? '')
      foreground.value = String(s.foreground ?? '#000000')
      background.value = String(s.background ?? '#ffffff')
      level.value = (['L', 'M', 'Q', 'H'].includes(String(s.level)) ? s.level : 'M') as ErrorCorrectionLevel
    }
  }
})
</script>

<template>
  <tool-page>
    <view class="card">
      <view class="card-title">内容（文字 / 链接）</view>
      <textarea v-model="text" class="textarea" placeholder="输入文字或链接，如 https://example.com" :maxlength="-1" />
      <view class="row copy-row">
        <copy-button :text="text" />
      </view>
    </view>

    <view class="card">
      <view class="card-title">样式</view>
      <view class="field-label">前景色</view>
      <view class="swatches">
        <view
          v-for="color in FOREGROUND_PRESETS"
          :key="color"
          class="swatch"
          :class="{ on: foreground === color }"
          :style="{ backgroundColor: color }"
          @click="foreground = color"
        />
        <input v-model="foreground" class="hex-input" placeholder="#000000">
      </view>
      <view class="field-label">背景色</view>
      <view class="swatches">
        <view
          v-for="color in BACKGROUND_PRESETS"
          :key="color"
          class="swatch"
          :class="{ on: background === color }"
          :style="{ backgroundColor: color }"
          @click="background = color"
        />
        <input v-model="background" class="hex-input" placeholder="#ffffff">
      </view>
      <view class="field-label">容错等级</view>
      <picker
        mode="selector"
        :range="LEVELS.map(item => item.label)"
        :value="levelIndex"
        @change="level = LEVELS[Number($event.detail.value)].value"
      >
        <view class="picker-box">{{ LEVELS[levelIndex].label }} ▾</view>
      </picker>
    </view>

    <view class="card preview-card">
      <view class="card-title">预览</view>
      <view class="preview-wrap">
        <canvas id="qr-preview" type="2d" class="preview" />
        <view v-if="!matrix" class="preview-empty">输入内容后生成二维码</view>
      </view>
      <view class="row actions">
        <button class="btn btn-plain" :disabled="!matrix" @click="saveStandard">
          保存标清（带水印）
        </button>
      </view>
      <view class="row actions">
        <button class="btn" :disabled="!matrix" @click="saveHd">
          {{ hdLabel }}
        </button>
      </view>
      <view class="muted hint">生成与标清保存永久免费；高清无水印为可选增值项，每日免费 1 次。</view>
    </view>
  </tool-page>
</template>

<style lang="scss" scoped>
.copy-row {
  justify-content: flex-end;
  margin-top: 16rpx;
}

.swatches {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
  flex-wrap: wrap;
}

.swatch {
  width: 56rpx;
  height: 56rpx;
  border-radius: 12rpx;
  border: 2rpx solid var(--border);

  &.on {
    outline: 4rpx solid var(--brand);
    outline-offset: 2rpx;
  }
}

.hex-input {
  width: 180rpx;
  background-color: var(--bg);
  border: 1rpx solid var(--border);
  border-radius: 12rpx;
  padding: 10rpx 16rpx;
  font-size: 24rpx;
}

.picker-box {
  background-color: var(--bg);
  border: 1rpx solid var(--border);
  border-radius: 12rpx;
  padding: 18rpx 20rpx;
  font-size: 26rpx;
}

.preview-card {
  display: flex;
  flex-direction: column;
}

.preview-wrap {
  position: relative;
  width: 500rpx;
  height: 500rpx;
  margin: 0 auto 24rpx;
}

.preview {
  width: 500rpx;
  height: 500rpx;
}

.preview-empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-3);
  font-size: 26rpx;
  background-color: var(--bg);
  border-radius: 12rpx;
}

.actions {
  margin-top: 16rpx;
}

.hint {
  margin-top: 16rpx;
  line-height: 1.6;
}
</style>