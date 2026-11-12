<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getTool, searchTools, type ToolMeta } from '@/tools-registry'
import { useHistoryStore } from '@/stores/history'
import { useFavoritesStore } from '@/stores/favorites'
import { maybeShowInterstitial } from '@/adapters/ad'

const query = ref('')
const history = useHistoryStore()
const favorites = useFavoritesStore()

const results = computed(() => searchTools(query.value))
const recentTools = computed(() =>
  history.recent.map(entry => getTool(entry.id)).filter((tool): tool is ToolMeta => !!tool),
)
const favoriteTools = computed(() =>
  favorites.ids.map(id => getTool(id)).filter((tool): tool is ToolMeta => !!tool),
)
const searching = computed(() => query.value.trim() !== '')

function open(tool: ToolMeta, restore = false) {
  uni.navigateTo({ url: restore ? `${tool.pagePath}?restore=1` : tool.pagePath })
}

function openAbout() {
  uni.navigateTo({ url: '/pages/about/about' })
}

let firstShow = true
onShow(() => {
  if (firstShow) {
    firstShow = false
    return
  }
  maybeShowInterstitial()
})
</script>

<template>
  <view class="page">
    <view class="brand">
      <image class="brand-logo" src="/static/logo.png" mode="aspectFit" />
      <view>
        <view class="brand-name">随手口袋工具</view>
        <view class="brand-slogan">纯本地计算 · 数据不出手机</view>
      </view>
    </view>

    <search-bar v-model="query" />

    <template v-if="!searching">
      <view v-if="favoriteTools.length" class="section">
        <view class="section-title">我的收藏</view>
        <scroll-view scroll-x class="h-scroll">
          <view class="h-row">
            <tool-card
              v-for="tool in favoriteTools"
              :key="tool.id"
              class="h-item"
              :tool="tool"
              :favorite="true"
              @open="open(tool)"
              @toggle-favorite="favorites.toggle(tool.id)"
            />
          </view>
        </scroll-view>
      </view>

      <view v-if="recentTools.length" class="section">
        <view class="section-title">最近使用</view>
        <scroll-view scroll-x class="h-scroll">
          <view class="h-row">
            <tool-card
              v-for="tool in recentTools"
              :key="tool.id"
              class="h-item"
              :tool="tool"
              :favorite="favorites.isFavorite(tool.id)"
              @open="open(tool, true)"
              @toggle-favorite="favorites.toggle(tool.id)"
            />
          </view>
        </scroll-view>
      </view>

      <ad-slot placement="home" />
    </template>

    <view class="section">
      <view class="section-title">{{ searching ? `搜索结果（${results.length}）` : '全部工具' }}</view>
      <view v-if="results.length" class="grid">
        <tool-card
          v-for="tool in results"
          :key="tool.id"
          :tool="tool"
          :favorite="favorites.isFavorite(tool.id)"
          @open="open(tool)"
          @toggle-favorite="favorites.toggle(tool.id)"
        />
      </view>
      <view v-else class="empty">
        没有找到相关工具，换个词试试？
      </view>
    </view>

    <view class="footer">
      <view class="footer-link" @click="openAbout">
        关于 · 开源许可
      </view>
      <view class="muted">基于开源项目 it-tools 移植 · GPL-3.0</view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.brand {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 12rpx 4rpx 28rpx;
}

.brand-logo {
  width: 88rpx;
  height: 88rpx;
  border-radius: 20rpx;
}

.brand-name {
  font-size: 36rpx;
  font-weight: 700;
}

.brand-slogan {
  font-size: 22rpx;
  color: var(--text-3);
  margin-top: 4rpx;
}

.section {
  margin-bottom: 28rpx;
}

.section-title {
  font-size: 26rpx;
  font-weight: 600;
  color: var(--text-2);
  margin-bottom: 16rpx;
}

.h-scroll {
  white-space: nowrap;
}

.h-row {
  display: inline-flex;
  gap: 16rpx;
  padding: 4rpx;
}

.h-item {
  width: 240rpx;
  flex-shrink: 0;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}

.empty {
  text-align: center;
  color: var(--text-3);
  padding: 80rpx 0;
}

.footer {
  margin-top: 48rpx;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.footer-link {
  color: var(--brand);
  font-size: 26rpx;
}
</style>