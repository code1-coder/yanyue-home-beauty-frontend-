<script setup lang="ts">
import { tab } from '../shared/navigation'
</script>
<template><view class="screen intro"><view class="brand">轻龄到家</view><view>上门美容服务</view><button class="action" @click="tab('pages/index/index')">开始体验</button></view></template>
<style scoped>.intro { padding-top: 25vh; text-align: center; }.brand { font-size: 48rpx; font-weight: 700; color: #187f70; margin-bottom: 20rpx; }</style>
