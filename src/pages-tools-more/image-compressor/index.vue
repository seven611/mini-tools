<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { formatBytes, savingsPercent, targetSize } from '@/core/image/compress'
import { chooseImage, compressImage, saveWithRetry, type ChosenImage, type CompressedImage } from '@/adapters/image'
import { useHistoryStore } from '@/stores/history'
import { useDebounceFn } from '@/composables/use-debounce'
import { useToolShare } from '@/composables/use-tool-share'

const TOOL_ID = 'image-compressor'
useToolShare(TOOL_ID)
const history = useHistoryStore()

const original = ref<ChosenImage | null>(null)
const compressed = ref<CompressedImage | null>(null)
const quality = ref(80)
const edgeIndex = ref(0)
const busy = ref(false)

const EDGES = [0, 2048, 1080, 720, 480]
const edgeLabels = ['原图尺寸', '长边 2048', '长边 1080', '长边 720', '长边 480']

const target = computed(() => original.value ? targetSize(original.value.width, original.value.height, EDGES[edgeIndex.value]) : null)
const savings = computed(() => original.value && compressed.value ? savingsPercent(original.value.size, compressed.value.size) : 0)

async function runCompress() {
  if (!original.value || !target.value) return
  busy.value = true
  try {
    compressed.value = await compressImage(original.value.path, {
      quality: quality.value / 100,
      width: target.value.width,
      height: target.value.height,
    })
  }
  catch {
    uni.showToast({ title: '压缩失败，请重试', icon: 'none' })
  }
  finally {
    busy.value = false
  }
}
const debouncedCompress = useDebounceFn(runCompress, 300)

async function pick() {
  try {
    original.value = await chooseImage()
    compressed.value = null
    await runCompress()
  }
  catch (e: any) {
    if (!/cancel/i.test(e?.errMsg || '')) {
      uni.showToast({ title: '选择图片失败，请确认已授权隐私指引', icon: 'none' })
    }
  }
}
function save() {
  if (compressed.value) saveWithRetry(compressed.value.path)
}

watch([quality, edgeIndex], debouncedCompress)

onLoad(() => {
  history.record(TOOL_ID)
})
</script>

<template>
  <tool-page>
    <view class="card">
      <view class="row-between">
        <view class="card-title no-margin">原图</view>
        <button class="btn btn-plain btn-small" @click="pick">{{ original ? '重新选择' : '选择图片' }}</button>
      </view>
      <template v-if="original">
        <image class="preview" :src="original.path" mode="aspectFit" />
        <view class="meta">
          <text>{{ original.width }}×{{ original.height }}</text>
          <text class="size">{{ formatBytes(original.size) }}</text>
        </view>
      </template>
      <view v-else class="empty">选择一张图片，本地压缩、不上传。</view>
    </view>

    <view v-if="original" class="card">
      <view class="card-title">压缩设置</view>
      <view class="slider-row">
        <text class="ch">质量</text>
        <slider :value="quality" :min="10" :max="100" :step="5" :block-size="20" activeColor="#84cc16"
          @change="quality = Number(($event as any).detail.value)" />
        <text class="val">{{ quality }}%</text>
      </view>
      <view class="field-label gap">输出尺寸</view>
      <picker mode="selector" :range="edgeLabels" :value="edgeIndex" @change="edgeIndex = Number($event.detail.value)">
        <view class="picker-box">{{ edgeLabels[edgeIndex] }} ▾</view>
      </picker>
      <view v-if="target" class="muted gap">目标：{{ target.width }}×{{ target.height }}</view>
    </view>

    <view v-if="original" class="card">
      <view class="row-between">
        <view class="card-title no-margin">压缩结果</view>
        <view v-if="compressed" class="badge">-{{ savings }}%</view>
      </view>
      <view v-if="busy" class="empty">压缩中…</view>
      <template v-else-if="compressed">
        <image class="preview" :src="compressed.path" mode="aspectFit" />
        <view class="meta">
          <text>{{ compressed.width }}×{{ compressed.height }}</text>
          <text class="size good">{{ formatBytes(compressed.size) }}</text>
        </view>
        <button class="btn gap" @click="save">保存到相册</button>
      </template>
      <view v-else class="empty">调整设置后自动压缩。</view>
    </view>
  </tool-page>
</template>

<style lang="scss" scoped>
.no-margin { margin-bottom: 0; }
.gap { margin-top: 20rpx; }
.preview {
  width: 100%;
  height: 320rpx;
  margin-top: 20rpx;
  border-radius: 16rpx;
  background-color: var(--bg);
}
.meta {
  display: flex;
  justify-content: space-between;
  margin-top: 12rpx;
  font-size: 26rpx;
  color: var(--text-2);
  .size { font-weight: 700; color: var(--text); }
  .good { color: #65a30d; }
}
.empty {
  padding: 60rpx 0;
  text-align: center;
  color: var(--text-3);
  font-size: 26rpx;
}
.badge {
  background-color: rgba(132, 204, 22, 0.15);
  color: #65a30d;
  font-weight: 700;
  font-size: 26rpx;
  border-radius: 10rpx;
  padding: 6rpx 16rpx;
}
.slider-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  slider { flex: 1; }
  .ch { flex: 0 0 70rpx; font-size: 26rpx; color: var(--text-2); font-weight: 600; }
  .val { flex: 0 0 90rpx; text-align: right; font-size: 26rpx; }
}
.picker-box {
  background-color: var(--bg);
  border: 1rpx solid var(--border);
  border-radius: 12rpx;
  height: 84rpx;
  line-height: 84rpx;
  padding: 0 20rpx;
  font-size: 26rpx;
}
</style>