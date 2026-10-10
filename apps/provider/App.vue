<script setup lang="ts">
import { onLaunch, onShow } from '@dcloudio/uni-app'
import { restoreSession } from './platform/guard'
onLaunch(() => { restoreSession() })
onShow(() => { restoreSession() })
</script>
<template><view /></template>
<style lang="scss">
@import 'uview-plus/index.scss';
page { background: #F9F7F3; color: #2D2D2D; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 28rpx; line-height: 1.5; }
.screen { box-sizing: border-box; min-height: 100vh; padding: 32rpx 32rpx calc(140rpx + env(safe-area-inset-bottom)); }
.hero { background: #EAF3EE; color: #386C5D; padding: 32rpx; border-radius: 32rpx; margin-bottom: 32rpx; }
.hero-title { font-size: 36rpx; font-weight: 700; display: block; }
.hero-sub { font-size: 24rpx; color: #666; display: block; margin-top: 8rpx; }
.section-title { font-size: 32rpx; font-weight: 600; margin: 40rpx 0 24rpx; display: block; color: #2D2D2D; }
.panel { background: #FFFFFF; border: 1rpx solid #EEF0EB; padding: 32rpx; border-radius: 32rpx; margin-bottom: 24rpx; box-shadow: 0 4rpx 20rpx rgba(65,100,87,.07); }
.row { display: flex; align-items: center; justify-content: space-between; gap: 20rpx; min-width: 0; }
.row > text, .row > view { min-width: 0; }
.stack { display: flex; flex-direction: column; gap: 24rpx; }
.muted { color: #999; font-size: 24rpx; line-height: 1.5; }
.money { color: #E27C68; font-weight: 700; }
.tag { font-size: 22rpx; color: #386C5D; background: #EAF3EE; padding: 8rpx 16rpx; border-radius: 999rpx; white-space: nowrap; }
.tag.pending { color: #9A6041; background: #FFEBD8; }
.tag.active-status { color: #386C5D; background: #EAF3EE; }
.tag.complete { color: #4E7190; background: #E8F3FF; }
.tag.cancelled { color: #777; background: #F4F4F4; }
.field { display: flex; flex-direction: column; gap: 12rpx; padding: 20rpx 0; font-size: 28rpx; }
.field input, .field textarea { box-sizing: border-box; width: 100%; border: 1rpx solid #E2E9E6; border-radius: 24rpx; background: #fff; font-size: 28rpx; color: #2D2D2D; }
.field input { box-sizing: border-box; height: 88rpx; line-height: 1.5; padding: 20rpx 24rpx; }
.field textarea { min-height: 150rpx; padding: 20rpx 24rpx; line-height: 1.5; }
.action, .secondary { box-sizing: border-box; min-height: 88rpx; display: flex; justify-content: center; align-items: center; padding: 16rpx 24rpx; border-radius: 24rpx; font-size: 28rpx; font-weight: 600; line-height: 1.4; margin: 24rpx 0 0; }
.action { background: #386C5D; color: #fff; border: 1rpx solid #386C5D; }
.secondary { background: #fff; color: #386C5D; border: 1rpx solid #386C5D; }
.action[disabled] { background: #D5DAD7; border-color: #D5DAD7; color: #fff; }
.action:active, .secondary:active, button[size="mini"]:active { opacity: .82; transform: scale(.99); }
.action::after, .secondary::after { border: 0; }
.danger { color: #E27C68; }
.chips { display: flex; flex-wrap: wrap; gap: 12rpx; margin: 20rpx 0; }
.chip { padding: 12rpx 24rpx; background: #fff; color: #666; border: 1rpx solid #E6ECE9; border-radius: 999rpx; font-size: 24rpx; white-space: nowrap; }
.chip.active { color: #fff; background: #386C5D; border-color: #386C5D; }
.empty { color: #999; text-align: center; padding: 56rpx 12rpx; font-size: 28rpx; }
.link { color: #386C5D; font-size: 26rpx; }
.notice { background: #F1F6F4; color: #667873; padding: 14rpx 20rpx; border-radius: 12rpx; font-size: 22rpx; margin-bottom: 24rpx; }
.divider { border-top: 1rpx solid #EEE; margin: 24rpx 0; }
button[size="mini"] { color: #386C5D; background: #fff; border: 1rpx solid #B8D2CA; border-radius: 16rpx; margin: 0; font-size: 24rpx; }
button[size="mini"]::after { border: 0; }
.tab-screen { box-sizing: border-box; min-height: 100vh; background: #F9F7F3; color: #292F2C; }
.tab-screen .notice { background: #F6EBE5; color: #685F59; border-left: 4rpx solid #C89C8A; border-radius: 16rpx; padding: 16rpx 20rpx; margin-bottom: 24rpx; line-height: 1.45; }
.tab-screen .section-title { margin: 36rpx 0 18rpx; color: #292F2C; }
.tab-screen .hero-title { color: #292F2C; }
.tab-screen .muted { color: #8A948E; }
.tab-screen .panel { background: #FFFFFF; border: 1rpx solid #EEF0EB; border-radius: 44rpx; box-shadow: 0 4rpx 20rpx rgba(65,100,87,.07); }
.tab-screen .tag { border-radius: 999rpx; color: #386C5D; background: #EAF3EE; }
.tab-screen .order-card .tag:not(.pending):not(.active-status):not(.complete):not(.cancelled),
.tab-screen .recent .tag:not(.pending):not(.active-status):not(.complete):not(.cancelled) { color: #4F6878; background: #EDF2F5; }
.tab-screen .tag.pending { color: #79563E; background: #FAEBDD; }
.tab-screen .tag.active-status { color: #386C5D; background: #EAF3EE; }
.tab-screen .tag.complete { color: #64706A; background: #EEF0EF; }
.tab-screen .tag.cancelled { color: #818886; background: #F4F4F2; }
.tab-screen .chip { background: #FFFEFC; border-color: #E6EBE7; color: #5F6863; padding: 14rpx 26rpx; }
.tab-screen .chip.active { background: #386C5D; border-color: #386C5D; color: #fff; }
.tab-screen .link, .tab-screen .money { color: #386C5D; }
</style>
