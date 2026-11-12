<script setup lang="ts">
import { computed } from 'vue'
import { ADS } from '@/config/ads'

const props = defineProps<{ placement: 'home' | 'tool' }>()
const unitId = computed(() => (props.placement === 'home' ? ADS.nativeHomeUnitId : ADS.nativeToolUnitId))
const show = computed(() => ADS.enabled && !!unitId.value)
</script>

<template>
  <!-- #ifdef MP-WEIXIN -->
  <view v-if="show" class="ad-slot">
    <ad-custom :unit-id="unitId" />
  </view>
  <!-- #endif -->
</template>

<style lang="scss" scoped>
.ad-slot {
  margin: 24rpx 0;
}
</style>