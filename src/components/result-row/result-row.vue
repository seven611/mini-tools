<script setup lang="ts">
defineProps<{
  label: string
  value: string
}>()
</script>

<template>
  <view class="result-row">
    <view class="label">{{ label }}</view>
    <view class="value">{{ value || '—' }}</view>
    <copy-button v-if="value" :text="value" />
  </view>
</template>

<style lang="scss" scoped>
.result-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 0;

  & + .result-row {
    border-top: 1rpx solid var(--border);
  }
}

.label {
  flex: 0 0 160rpx;
  font-size: 26rpx;
  color: var(--text-2);
}

.value {
  flex: 1;
  font-size: 28rpx;
  font-weight: 600;
  word-break: break-all;
}
</style>