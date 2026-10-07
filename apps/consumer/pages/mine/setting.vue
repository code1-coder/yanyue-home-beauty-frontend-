<script setup lang="ts">
import { notice, go } from '../../shared/navigation'
function clearCache() { notice('演示订单数据保留，正式缓存策略待确认') }
</script>
<template><view class="screen"><view class="panel" @click="clearCache">清除缓存 ›</view><view class="panel" @click="go('pages/login')">退出演示账户 ›</view><view class="panel">关于轻龄到家</view><view class="panel muted">用户协议 / 隐私政策：正式文案与路由待确认，不展示虚构条款。</view></view></template>
