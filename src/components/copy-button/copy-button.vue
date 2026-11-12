<script setup lang="ts">
import { useCopy } from '@/composables/use-copy'

defineProps<{ text: string }>()
const { copy } = useCopy()
</script>

<template>
  <button class="btn btn-plain btn-small" @click="copy(text)">
    复制
  </button>
</template>