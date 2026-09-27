<script setup lang="ts">
import { go } from '../navigation'
defineProps<{ label: string; path: string; hint?: string; icon?: string }>()
</script>
<template><view class="link-row row" @click="go(path)"><view class="link-content row"><u-icon v-if="icon" :name="icon === 'wallet' ? 'rmb-circle' : icon" size="20" color="#386C5D"/><view class="link-copy"><text>{{ label }}</text><text v-if="hint" class="muted">{{ hint }}</text></view></view><u-icon name="arrow-right" size="16" color="#9AA39E" /></view></template>
<style scoped>.link-row { min-height: 96rpx; padding: 8rpx 0; border-bottom: 1rpx solid #F0F2EF; }.link-row:active { opacity: .72; }.link-row:last-child { border: 0; }.link-content { justify-content: flex-start; gap: 16rpx; min-width: 0; }.link-copy { min-width: 0; display: flex; flex-direction: column; gap: 4rpx; }</style>
