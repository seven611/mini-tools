<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getPasswordCrackTimeEstimation } from '@/core/password/strength'
import { formatNumber } from '@/core/shared/format'
import { useHistoryStore } from '@/stores/history'
import { useDebounceFn } from '@/composables/use-debounce'
import { useToolShare } from '@/composables/use-tool-share'

const TOOL_ID = 'password-strength'
useToolShare(TOOL_ID)
const history = useHistoryStore()

const password = ref('')
const showPassword = ref(false)

const estimation = computed(() => getPasswordCrackTimeEstimation({ password: password.value }))
const scoreLabel = computed(() => {
  const score = estimation.value.score
  if (password.value === '') {
    return '未输入'
  }
  if (score < 0.25) {
    return '弱'
  }
  if (score < 0.5) {
    return '中等'
  }
  if (score < 0.75) {
    return '强'
  }
  return '极强'
})
const scoreColor = computed(() => {
  const score = estimation.value.score
  if (score < 0.25) {
    return '#EF4444'
  }
  if (score < 0.5) {
    return '#F59E0B'
  }
  if (score < 0.75) {
    return '#21B573'
  }
  return '#0EA5E9'
})

const saveSnapshot = useDebounceFn(() => {
  history.saveSnapshot(TOOL_ID, { password: password.value })
}, 400)
watch(password, saveSnapshot)

onLoad((options) => {
  history.record(TOOL_ID)
  if (options?.restore === '1') {
    const s = history.getSnapshot(TOOL_ID)
    if (s) {
      password.value = String(s.password ?? '')
    }
  }
})
</script>

<template>
  <tool-page>
    <view class="card">
      <view class="card-title">输入密码</view>
      <input
        v-model="password"
        class="input"
        :password="!showPassword"
        placeholder="输入要检测的密码"
      >
      <view class="switch-item">
        <text>显示密码</text>
        <switch :checked="showPassword" color="#21B573" @change="showPassword = ($event as any).detail.value" />
      </view>
    </view>

    <view class="card">
      <view class="row-between">
        <view class="card-title no-margin">强度：{{ scoreLabel }}</view>
        <copy-button v-if="password" :text="password" />
      </view>
      <view class="bar">
        <view class="bar-fill" :style="{ width: `${estimation.score * 100}%`, backgroundColor: scoreColor }" />
      </view>
      <result-row label="熵 (bits)" :value="formatNumber(estimation.entropy, 1)" />
      <result-row label="字符集大小" :value="String(estimation.charsetLength)" />
      <result-row label="长度" :value="String(estimation.passwordLength)" />
      <result-row label="预计破解时间" :value="estimation.crackDurationFormatted" />
    </view>

    <view class="muted hint">
      按每秒 10 亿次猜测估算，仅供本地参考；密码不会上传，检测完全在手机上完成。
    </view>
  </tool-page>
</template>

<style lang="scss" scoped>
.no-margin {
  margin-bottom: 0;
}

.switch-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 26rpx;
  color: var(--text-2);
  margin-top: 16rpx;
}

.bar {
  height: 12rpx;
  border-radius: 6rpx;
  background-color: var(--bg);
  overflow: hidden;
  margin: 20rpx 0 8rpx;
}

.bar-fill {
  height: 100%;
  border-radius: 6rpx;
  transition: width 0.2s;
}

.hint {
  padding: 0 8rpx;
  line-height: 1.6;
}
</style>