<script setup lang="ts">
import type { ToolMeta } from '@/tools-registry'

defineProps<{
  tool: ToolMeta
  favorite: boolean
}>()

defineEmits<{
  (e: 'open'): void
  (e: 'toggleFavorite'): void
}>()
</script>

<template>
  <view class="tool-card" @click="$emit('open')">
    <view class="star" :class="{ active: favorite }" @click.stop="$emit('toggleFavorite')">
      {{ favorite ? '★' : '☆' }}
    </view>
    <view class="icon" :style="{ backgroundColor: tool.color }">
      {{ tool.icon }}
    </view>
    <view class="name">{{ tool.name }}</view>
    <view class="desc">{{ tool.description }}</view>
  </view>
</template>

<style lang="scss" scoped>
.tool-card {
  position: relative;
  background-color: var(--card);
  border-radius: 20rpx;
  padding: 28rpx 24rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.star {
  position: absolute;
  top: 16rpx;
  right: 20rpx;
  font-size: 36rpx;
  color: var(--text-3);
  padding: 8rpx;

  &.active {
    color: #f59e0b;
  }
}

.icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 18rpx;
  color: #ffffff;
  font-size: 40rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.name {
  font-size: 28rpx;
  font-weight: 600;
  margin-top: 8rpx;
}

.desc {
  font-size: 22rpx;
  color: var(--text-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>