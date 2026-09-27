<script setup lang="ts">
import { showDemoLimit } from '../../shared/navigation'
</script>
<template><view class="screen"><view class="section-title">安全中心</view><view class="panel" @click="showDemoLimit">紧急联系人 ›</view><view class="panel" @click="showDemoLimit">行程分享 ›</view><button class="secondary" @click="showDemoLimit">一键求助（待接入）</button><view class="muted section">当前功能未接入，请勿用于实际求助。</view></view></template>
