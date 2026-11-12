<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getCharacterCount, getLineCount, getStringSizeInBytes, getWordCount } from '@/core/text/statistics'
import { useHistoryStore } from '@/stores/history'
import { useDebounceFn } from '@/composables/use-debounce'
import { useToolShare } from '@/composables/use-tool-share'

const TOOL_ID = 'text-statistics'
useToolShare(TOOL_ID)
const history = useHistoryStore()

const text = ref('')

const characters = computed(() => String(getCharacterCount(text.value)))
const words = computed(() => String(getWordCount(text.value)))
const lines = computed(() => String(getLineCount(text.value)))
const bytes = computed(() => String(getStringSizeInBytes(text.value)))

const saveSnapshot = useDebounceFn(() => {
  history.saveSnapshot(TOOL_ID, { text: text.value })
}, 400)
watch(text, saveSnapshot)

onLoad((options) => {
  history.record(TOOL_ID)
  if (options?.restore === '1') {
    const s = history.getSnapshot(TOOL_ID)
    if (s) {
      text.value = String(s.text ?? '')
    }
  }
})
</script>

<template>
  <tool-page>
    <view class="card">
      <view class="card-title">输入文本</view>
      <textarea v-model="text" class="textarea" placeholder="粘贴作文、文案、小红书笔记…" :maxlength="-1" />
    </view>

    <view class="card">
      <view class="card-title">统计结果</view>
      <result-row label="字符数" :value="characters" />
      <result-row label="字数（词）" :value="words" />
      <result-row label="行数" :value="lines" />
      <result-row label="字节数 (UTF-8)" :value="bytes" />
    </view>

    <view class="muted hint">
      中文按字计数，英文按词计数；字节数按 UTF-8 编码（中文通常 3 字节）。
    </view>
  </tool-page>
</template>

<style lang="scss" scoped>
.hint {
  padding: 0 8rpx;
  line-height: 1.6;
}
</style>