<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { createToken } from '@/core/password/generator'
import { createSecureRng } from '@/core/shared/random'
import { getRandomBytes } from '@/adapters/random'
import { useHistoryStore } from '@/stores/history'
import { useDebounceFn } from '@/composables/use-debounce'
import { usePremiumQuota } from '@/composables/use-premium-quota'
import { useToolShare } from '@/composables/use-tool-share'

const TOOL_ID = 'password-generator'
useToolShare(TOOL_ID)
const history = useHistoryStore()

const length = ref(16)
const withUppercase = ref(true)
const withLowercase = ref(true)
const withNumbers = ref(true)
const withSymbols = ref(false)

const password = ref('')
const batch = ref<string[]>([])
const { left, requestUse } = usePremiumQuota('pwd-batch')

const hasCharset = computed(() =>
  withUppercase.value || withLowercase.value || withNumbers.value || withSymbols.value,
)
const batchLabel = computed(() =>
  left.value.free > 0 ? '批量生成 10 组（今日免费 1 次）' : '批量生成 10 组（看广告解锁）',
)

function tokenOptions() {
  return {
    withUppercase: withUppercase.value,
    withLowercase: withLowercase.value,
    withNumbers: withNumbers.value,
    withSymbols: withSymbols.value,
    length: length.value,
  }
}

async function generate() {
  if (!hasCharset.value) {
    return
  }
  const bytes = await getRandomBytes(length.value * 4)
  password.value = createToken({ ...tokenOptions(), rng: createSecureRng(bytes) })
}

async function generateBatch() {
  if (!hasCharset.value) {
    return
  }
  const source = await requestUse()
  if (source === 'none') {
    uni.showToast({ title: '未解锁，明天再试', icon: 'none' })
    return
  }
  const bytes = await getRandomBytes(length.value * 4 * 10)
  const rng = createSecureRng(bytes)
  batch.value = Array.from({ length: 10 }, () => createToken({ ...tokenOptions(), rng }))
}

const saveSnapshot = useDebounceFn(() => {
  history.saveSnapshot(TOOL_ID, {
    length: length.value,
    withUppercase: withUppercase.value,
    withLowercase: withLowercase.value,
    withNumbers: withNumbers.value,
    withSymbols: withSymbols.value,
  })
}, 400)
watch([length, withUppercase, withLowercase, withNumbers, withSymbols], saveSnapshot)

onLoad((options) => {
  history.record(TOOL_ID)
  if (options?.restore === '1') {
    const s = history.getSnapshot(TOOL_ID)
    if (s) {
      length.value = Number(s.length ?? 16)
      withUppercase.value = Boolean(s.withUppercase ?? true)
      withLowercase.value = Boolean(s.withLowercase ?? true)
      withNumbers.value = Boolean(s.withNumbers ?? true)
      withSymbols.value = Boolean(s.withSymbols ?? false)
    }
  }
  generate()
})
</script>

<template>
  <tool-page>
    <view class="card">
      <view class="row-between">
        <view class="card-title no-margin">长度：{{ length }}</view>
      </view>
      <slider
        :value="length"
        :min="4"
        :max="64"
        :step="1"
        show-value
        active-color="#21B573"
        @change="length = Number($event.detail.value)"
      />
      <view class="switch-row">
        <view class="switch-item">
          <text>大写 A-Z</text>
          <switch :checked="withUppercase" color="#21B573" @change="withUppercase = ($event as any).detail.value" />
        </view>
        <view class="switch-item">
          <text>小写 a-z</text>
          <switch :checked="withLowercase" color="#21B573" @change="withLowercase = ($event as any).detail.value" />
        </view>
        <view class="switch-item">
          <text>数字 0-9</text>
          <switch :checked="withNumbers" color="#21B573" @change="withNumbers = ($event as any).detail.value" />
        </view>
        <view class="switch-item">
          <text>符号 !@#</text>
          <switch :checked="withSymbols" color="#21B573" @change="withSymbols = ($event as any).detail.value" />
        </view>
      </view>
      <view v-if="!hasCharset" class="error">请至少选择一种字符类型</view>
    </view>

    <view class="card">
      <view class="card-title">生成结果</view>
      <view class="password">{{ password || '—' }}</view>
      <view class="row actions">
        <button class="btn btn-plain" :disabled="!hasCharset" @click="generate">
          重新生成
        </button>
        <copy-button :text="password" />
      </view>
    </view>

    <view class="card">
      <view class="card-title">增值功能</view>
      <button class="btn" :disabled="!hasCharset" @click="generateBatch">
        {{ batchLabel }}
      </button>
      <view v-if="batch.length" class="batch">
        <view v-for="(item, index) in batch" :key="index" class="batch-item">
          <view class="batch-value">{{ item }}</view>
          <copy-button :text="item" />
        </view>
      </view>
      <view class="muted hint">核心生成永久免费不限次；批量为可选增值项，每日免费 1 次。</view>
    </view>
  </tool-page>
</template>

<style lang="scss" scoped>
.no-margin {
  margin-bottom: 0;
}

.switch-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12rpx 24rpx;
  margin-top: 12rpx;
}

.switch-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 26rpx;
  color: var(--text-2);
}

.error {
  color: var(--danger);
  font-size: 24rpx;
  margin-top: 12rpx;
}

.password {
  font-family: monospace;
  font-size: 32rpx;
  font-weight: 600;
  word-break: break-all;
  line-height: 1.6;
}

.actions {
  margin-top: 20rpx;

  .btn {
    flex: 1;
  }
}

.batch {
  margin-top: 20rpx;
}

.batch-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 12rpx 0;
  border-top: 1rpx solid var(--border);
}

.batch-value {
  flex: 1;
  font-family: monospace;
  font-size: 24rpx;
  word-break: break-all;
}

.hint {
  margin-top: 16rpx;
  line-height: 1.6;
}
</style>