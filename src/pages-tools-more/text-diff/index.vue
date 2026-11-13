<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { diffLines, type DiffLine } from '@/core/text/diff'
import { useHistoryStore } from '@/stores/history'
import { useToolShare } from '@/composables/use-tool-share'

const TOOL_ID = 'text-diff'
useToolShare(TOOL_ID)
const history = useHistoryStore()

const a = ref('')
const b = ref('')
const result = ref<DiffLine[] | null>(null)

const stats = computed(() => {
  if (!result.value) return null
  return {
    add: result.value.filter(l => l.type === 'add').length,
    del: result.value.filter(l => l.type === 'del').length,
  }
})

const unified = computed(() => {
  if (!result.value) return ''
  return result.value.map(l => (l.type === 'add' ? '+ ' : l.type === 'del' ? '- ' : '  ') + l.text).join('\n')
})

function run() {
  result.value = diffLines(a.value, b.value)
}

onLoad(() => {
  history.record(TOOL_ID)
})
</script>

<template>
  <tool-page>
    <view class="card">
      <view class="card-title">原始文本</view>
      <textarea v-model="a" class="textarea" placeholder="粘贴原始文本…" :maxlength="-1" />
      <view class="card-title gap">对比文本</view>
      <textarea v-model="b" class="textarea" placeholder="粘贴修改后的文本…" :maxlength="-1" />
      <button class="btn gap" @click="run">开始对比</button>
    </view>

    <view v-if="result" class="card">
      <view class="row-between">
        <view class="card-title no-margin">对比结果</view>
        <view class="stats">
          <text class="add">+{{ stats!.add }}</text>
          <text class="del">-{{ stats!.del }}</text>
        </view>
      </view>
      <scroll-view scroll-y class="diff">
        <view v-for="(l, i) in result" :key="i" class="line" :class="l.type">
          <text class="sign">{{ l.type === 'add' ? '+' : l.type === 'del' ? '-' : ' ' }}</text>
          <text class="txt">{{ l.text || ' ' }}</text>
        </view>
      </scroll-view>
      <copy-button v-if="unified" :text="unified" />
    </view>
  </tool-page>
</template>

<style lang="scss" scoped>
.gap { margin-top: 20rpx; }
.no-margin { margin-bottom: 0; }
.stats { display: flex; gap: 16rpx; font-size: 26rpx; font-weight: 600;
  .add { color: #21b573; } .del { color: #ef4444; } }
.diff { max-height: 700rpx; margin-top: 16rpx; border-radius: 12rpx; overflow: hidden; }
.line {
  display: flex; gap: 12rpx; padding: 8rpx 12rpx; font-size: 24rpx;
  .sign { flex: 0 0 24rpx; font-weight: 700; }
  .txt { word-break: break-all; white-space: pre-wrap; }
  &.add { background-color: rgba(33, 181, 115, 0.12); color: #1a7f52; }
  &.del { background-color: rgba(239, 68, 68, 0.12); color: #b91c1c; text-decoration: line-through; }
  &.same { color: var(--text-2); }
}
</style>