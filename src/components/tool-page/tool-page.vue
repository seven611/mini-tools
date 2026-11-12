<script setup lang="ts">
</script>

<template>
  <view class="page">
    <slot />
    <ad-slot placement="tool" />
    <privacy-popup />
  </view>
</template>