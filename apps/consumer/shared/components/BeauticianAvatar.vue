<script setup lang="ts">
defineProps<{ name: string; size?: 'small' | 'large' }>()
</script>

<template>
  <view class="avatar" :class="size === 'large' ? 'large' : 'small'" aria-label="美容师示意头像">
    <text class="avatar-name">{{ name.slice(0, 1) }}</text>
  </view>
</template>

<style scoped>
.avatar { flex: none; display: flex; align-items: center; justify-content: center; background: #f5e4e6; color: #a84f62; border: 1rpx solid #ebd3d8; border-radius: 6rpx; box-sizing: border-box; }
.small { width: 108rpx; height: 108rpx; }
.large { width: 154rpx; height: 154rpx; }
.avatar-name { font-size: 42rpx; font-weight: 600; }
.large .avatar-name { font-size: 60rpx; }
</style>
