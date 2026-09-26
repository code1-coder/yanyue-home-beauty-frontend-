<script setup lang="ts">
defineProps<{ title: string; detail: string; meta?: string; price?: number }>()
defineEmits<{ select: [] }>()
</script>
<template>
  <view class="panel card" @click="$emit('select')">
    <view class="row"><text class="title">{{ title }}</text><text v-if="price !== undefined" class="price">¥{{ price }}</text></view>
    <view class="muted">{{ detail }}</view><view v-if="meta" class="meta">{{ meta }}</view>
  </view>
</template>
<style scoped>
.card { min-height: 112rpx; }
.title { font-weight: 650; font-size: 30rpx; }
.muted { margin-top: 14rpx; }
.meta { color: #187f70; font-size: 24rpx; margin-top: 14rpx; }
</style>
