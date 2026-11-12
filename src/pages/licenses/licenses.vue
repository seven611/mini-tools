<script setup lang="ts">
import { LINKS } from '@/config/links'
import { useCopy } from '@/composables/use-copy'

const { copy } = useCopy()

const MIT_LIBS = [
  { name: 'qrcode', copyright: 'Copyright (c) 2012 Ryan Day' },
  { name: 'date-fns', copyright: 'Copyright (c) 2021 Sasha Koss and Lesha Koss' },
  { name: 'pinia', copyright: 'Copyright (c) 2019-present Eduardo San Martin Morote' },
  { name: 'vue', copyright: 'Copyright (c) 2018-present, Yuxi (Evan) You' },
]
</script>

<template>
  <view class="page">
    <view class="card">
      <view class="card-title">本程序许可证</view>
      <view class="body">
        随手口袋工具 整体以 GNU General Public License v3.0（GPL-3.0）发布。
        移植自 it-tools 的文件保留上游版权声明与修改说明；原创文件同样以 GPL-3.0 发布。
        许可证全文见源码仓库 LICENSE 文件。
      </view>
      <view class="link-row">
        <view class="link-text">{{ LINKS.upstreamRepo }}</view>
        <button class="btn btn-plain btn-small" @click="copy(LINKS.upstreamRepo)">
          复制
        </button>
      </view>
    </view>

    <view class="card">
      <view class="card-title">第三方库（MIT）</view>
      <view v-for="lib in MIT_LIBS" :key="lib.name" class="lib">
        <view class="lib-name">{{ lib.name }}</view>
        <view class="muted">{{ lib.copyright }}</view>
      </view>
      <view class="body mit-text">
        Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
        associated documentation files (the "Software"), to deal in the Software without restriction,
        including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
        and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
        subject to the following conditions: The above copyright notice and this permission notice shall be
        included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS",
        WITHOUT WARRANTY OF ANY KIND.
      </view>
    </view>

    <view class="card">
      <view class="card-title">第三方库（Apache-2.0）</view>
      <view class="lib">
        <view class="lib-name">@dcloudio/uni-app 运行时</view>
        <view class="muted">Copyright DCloud · Apache License 2.0</view>
      </view>
      <view class="body">
        Apache-2.0 全文见源码仓库 THIRD-PARTY-NOTICES.md 附录。
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
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

.lib {
  padding: 12rpx 0;
  border-bottom: 1rpx solid var(--border);
}

.lib-name {
  font-size: 28rpx;
  font-weight: 600;
}

.mit-text {
  margin-top: 20rpx;
  font-size: 22rpx;
}
</style>