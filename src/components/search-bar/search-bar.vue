<script setup lang="ts">
defineProps<{ modelValue: string }>()
defineEmits<{ (e: 'update:modelValue', value: string): void }>()
</script>

<template>
  <view class="search-bar">
    <input
      class="search-input"
      :value="modelValue"
      placeholder="搜索工具，如：二维码 / mima"
      placeholder-class="search-placeholder"
      confirm-type="search"
      @input="$emit('update:modelValue', ($event as any).detail.value)"
    >
    <view v-if="modelValue" class="clear" @click="$emit('update:modelValue', '')">
      ×
    </view>
  </view>
</template>

<style lang="scss" scoped>
.search-bar {
  position: relative;
  margin-bottom: 24rpx;
}

.search-input {
  background-color: var(--card);
  border: 1rpx solid var(--border);
  border-radius: 16rpx;
  padding: 20rpx 70rpx 20rpx 28rpx;
  font-size: 28rpx;
  color: var(--text);
}

.search-placeholder {
  color: var(--text-3);
}

.clear {
  position: absolute;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-3);
  font-size: 36rpx;
}
</style>