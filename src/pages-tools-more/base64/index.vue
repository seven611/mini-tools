<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { base64Decode, base64Encode } from '@/core/text/base64'
import { useHistoryStore } from '@/stores/history'
import { useToolShare } from '@/composables/use-tool-share'

const TOOL_ID = 'base64'
useToolShare(TOOL_ID)
const history = useHistoryStore()

const input = ref('')
const output = ref('')
const error = ref('')

function encode() {
  error.value = ''
  output.value = base64Encode(input.value)
}
function decode() {
  const r = base64Decode(input.value)
  if (r == null) {
    error.value = '无效的 Base64 字符串'
    output.value = ''
  }
  else {
    error.value = ''
    output.value = r
  }
}

onLoad(() => {
  history.record(TOOL_ID)
})
</script>

<template>
  <tool-page>
    <view class="card">
      <view class="card-title">输入文本 / Base64</view>
      <textarea v-model="input" class="textarea" placeholder="输入要编码的文本，或要解码的 Base64…" :maxlength="-1" />
      <view class="row gap">
        <button class="btn" @click="encode">编码 →</button>
        <button class="btn btn-plain" @click="decode">← 解码</button>
      </view>
      <view v-if="error" class="error">{{ error }}</view>
    </view>

    <view class="card">
      <view class="row-between">
        <view class="card-title no-margin">结果</view>
        <copy-button v-if="output" :text="output" />
      </view>
      <view class="output">{{ output || '—' }}</view>
    </view>
  </tool-page>
</template>

<style lang="scss" scoped>
.gap { margin-top: 20rpx; }
.no-margin { margin-bottom: 0; }
.row .btn { flex: 1; }
.error { color: var(--danger); font-size: 24rpx; margin-top: 12rpx; }
.output {
  margin-top: 16rpx;
  background-color: var(--bg);
  border-radius: 12rpx;
  padding: 18rpx 20rpx;
  font-size: 26rpx;
  word-break: break-all;
  white-space: pre-wrap;
  min-height: 80rpx;
}
</style>