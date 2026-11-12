<script setup lang="ts">
import { usePrivacy } from '@/composables/use-privacy'

const { visible, agree, disagree } = usePrivacy()
</script>

<template>
  <view v-if="visible" class="mask">
    <view class="popup">
      <view class="title">隐私保护提示</view>
      <view class="body">
        复制结果需使用剪贴板，保存二维码需写入相册。所有计算均在本地完成，数据不出手机。
      </view>
      <view class="actions">
        <button class="btn btn-plain" @click="disagree">
          拒绝
        </button>
        <button class="btn" open-type="agreePrivacyAuthorization" @agreeprivacyauthorization="agree">
          同意
        </button>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.mask {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.popup {
  width: 600rpx;
  background-color: var(--card);
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
}

.title {
  font-size: 32rpx;
  font-weight: 700;
  margin-bottom: 20rpx;
}

.body {
  font-size: 26rpx;
  color: var(--text-2);
  line-height: 1.7;
  margin-bottom: 32rpx;
}

.actions {
  display: flex;
  gap: 20rpx;

  .btn {
    flex: 1;
  }
}
</style>