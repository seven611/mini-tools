<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { rmbToUppercase } from '@/core/rmb/uppercase'
import { useHistoryStore } from '@/stores/history'
import { useDebounceFn } from '@/composables/use-debounce'
import { useToolShare } from '@/composables/use-tool-share'

const TOOL_ID = 'rmb-uppercase'
useToolShare(TOOL_ID)
const history = useHistoryStore()

const amount = ref('')

const uppercase = computed(() => (amount.value.trim() ? rmbToUppercase(amount.value) : null))
const invalid = computed(() => amount.value.trim() !== '' && uppercase.value === null)

const saveSnapshot = useDebounceFn(() => {
  history.saveSnapshot(TOOL_ID, { amount: amount.value })
}, 400)
watch(amount, saveSnapshot)

onLoad((options) => {
  history.record(TOOL_ID)
  if (options?.restore === '1') {
    const s = history.getSnapshot(TOOL_ID)
    if (s) {
      amount.value = String(s.amount ?? '')
    }
  }
})
</script>

<template>
  <tool-page>
    <view class="card">
      <view class="card-title">金额（元）</view>
      <input v-model="amount" class="input" type="digit" placeholder="如 1234.56">
      <view v-if="invalid" class="error">
        请输入有效金额（最大支持到万亿，最多两位小数四舍五入）
      </view>
    </view>

    <view class="card">
      <view class="card-title">中文大写</view>
      <view class="uppercase">{{ uppercase || '—' }}</view>
      <view v-if="uppercase" class="row copy-row">
        <copy-button :text="uppercase" />
      </view>
    </view>

    <view class="muted hint">
      财务规范写法：壹贰叁肆伍陆柒捌玖、拾佰仟万亿元角分整。报销、发票、合同填写必备。
    </view>
  </tool-page>
</template>

<style lang="scss" scoped>
.error {
  color: var(--danger);
  font-size: 24rpx;
  margin-top: 12rpx;
}

.uppercase {
  font-size: 36rpx;
  font-weight: 700;
  line-height: 1.6;
  word-break: break-all;
}

.copy-row {
  margin-top: 20rpx;
  justify-content: flex-end;
}

.hint {
  padding: 0 8rpx;
  line-height: 1.6;
}
</style>