<script setup lang="ts">
import { LINKS } from '@/config/links'
import { useCopy } from '@/composables/use-copy'

const { copy } = useCopy()

function openLicenses() {
  uni.navigateTo({ url: '/pages/licenses/licenses' })
}
</script>

<template>
  <view class="page">
    <view class="card hero">
      <image class="logo" src="/static/logo.png" mode="aspectFit" />
      <view class="name">随手口袋工具</view>
      <view class="muted">版本 0.1.0</view>
      <view class="slogan">纯本地计算 · 无需登录 · 数据不出手机</view>
    </view>

    <view class="card">
      <view class="card-title">隐私承诺</view>
      <view class="body">
        所有工具均在你的手机本地完成计算，不上传任何输入内容，不收集个人信息，无网络请求。
        仅在您主动操作时使用：剪贴板（复制结果）、相册写入（保存二维码图片）。
      </view>
    </view>

    <view class="card">
      <view class="card-title">开源声明</view>
      <view class="body">
        本小程序基于开源项目 it-tools（Copyright Corentin Thomasset）移植，整体以 GPL-3.0 许可证开源。
        您可以自由使用、修改与分发本程序源码，但需保留相同许可证与署名。
      </view>
      <view class="link-row">
        <view class="link-text">{{ LINKS.upstreamRepo }}</view>
        <button class="btn btn-plain btn-small" @click="copy(LINKS.upstreamRepo)">
          复制
        </button>
      </view>
      <view v-if="LINKS.sourceRepo" class="link-row">
        <view class="link-text">{{ LINKS.sourceRepo }}</view>
        <button class="btn btn-plain btn-small" @click="copy(LINKS.sourceRepo)">
          复制
        </button>
      </view>
      <view v-else class="muted">本小程序源码仓库：发布前公开（GPL-3.0）。</view>
      <view class="row licenses-row">
        <button class="btn btn-plain" @click="openLicenses">
          查看开源许可
        </button>
      </view>
    </view>

    <view class="card">
      <view class="card-title">致谢</view>
      <view class="body">
        感谢 it-tools 作者 Corentin Thomasset 与贡献者，以及 qrcode、date-fns、pinia、Vue、uni-app 等开源项目。
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 48rpx 28rpx;
}

.logo {
  width: 128rpx;
  height: 128rpx;
  border-radius: 28rpx;
  margin-bottom: 12rpx;
}

.name {
  font-size: 36rpx;
  font-weight: 700;
}

.slogan {
  margin-top: 12rpx;
  color: var(--brand);
  font-size: 24rpx;
}

.body {
  font-size: 26rpx;
  color: var(--text-2);
  line-height: 1.8;
}

.link-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 20rpx;
}

.link-text {
  flex: 1;
  font-size: 24rpx;
  color: var(--text-3);
  word-break: break-all;
}

.licenses-row {
  margin-top: 24rpx;
}
</style>