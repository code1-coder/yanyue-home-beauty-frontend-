<script setup lang="ts">
import { profileRepository } from '../../features/services'
import { go } from '../../shared/navigation'
import DemoNotice from '../../shared/components/DemoNotice.vue'
const profile = profileRepository.profile()
const shortcuts = [
  { label: '地址管理', path: 'pages/address/list', icon: 'map' },
  { label: '优惠券', path: 'pages/mine/coupon', icon: 'gift' },
  { label: '消息中心', path: 'pages/message/list', icon: 'bell' },
  { label: '我的评价', path: 'pages/mine/comment', icon: 'star' }
]
const supportLinks = [
  { label: '安全中心', path: 'pages/safety/index', icon: 'lock' },
  { label: '客服与投诉', path: 'pages/service/complaint', icon: 'kefu-ermai' },
  { label: '设置', path: 'pages/mine/setting', icon: 'setting' }
]
</script>
<template>
  <view class="screen mine-screen"><DemoNotice /><view class="profile"><view class="profile-avatar">颜</view><view class="profile-info"><text class="profile-name">{{ profile.nickname }}</text><text class="muted">演示账户 · 余额 {{ profile.balanceLabel }}</text></view><text class="profile-link" @click="go('pages/login')">登录 ›</text></view>
    <view class="orders" @click="go('pages/order/list')"><view><text class="orders-title">我的预约</text><text class="muted">查看订单、服务进度与售后</text></view><u-icon name="arrow-right" size="18" color="#a69994" /></view>
    <view class="section-label">常用服务</view><view class="shortcut-grid"><view v-for="item in shortcuts" :key="item.path" class="shortcut" @click="go(item.path)"><view class="shortcut-icon"><u-icon :name="item.icon" size="24" color="#b9596a" /></view><text>{{ item.label }}</text></view></view>
    <view class="section-label">服务与保障</view><view class="menu"><view v-for="item in supportLinks" :key="item.path" class="menu-row" @click="go(item.path)"><u-icon :name="item.icon" size="21" color="#698477" /><text>{{ item.label }}</text><u-icon name="arrow-right" size="16" color="#a69994" /></view></view>
    <view class="mine-note">上门服务前请核对美容师信息与预约地点</view>
  </view>
</template>
<style scoped>
.mine-screen { padding: 12rpx 24rpx 145rpx; }.profile { display: flex; gap: 20rpx; align-items: center; padding: 24rpx 4rpx 34rpx; }.profile-avatar { width: 106rpx; height: 106rpx; flex: none; border-radius: 50%; background: #f4e1e5; color: #aa5062; display: flex; align-items: center; justify-content: center; font-size: 42rpx; font-weight: 650; }.profile-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8rpx; }.profile-name { font-size: 35rpx; font-weight: 700; }.profile-link { color: #a75666; font-size: 24rpx; padding: 12rpx 0; white-space: nowrap; }.orders { background: #fff; display: flex; justify-content: space-between; align-items: center; padding: 29rpx 24rpx; border-radius: 8rpx; }.orders > view { display: flex; flex-direction: column; gap: 7rpx; }.orders-title { font-weight: 650; font-size: 30rpx; }.section-label { margin: 32rpx 0 17rpx; font-size: 31rpx; font-weight: 650; }.shortcut-grid { background: #fff; border-radius: 8rpx; display: grid; grid-template-columns: repeat(4, 1fr); padding: 23rpx 6rpx; }.shortcut { display: flex; flex-direction: column; align-items: center; gap: 12rpx; font-size: 22rpx; white-space: nowrap; }.shortcut-icon { width: 70rpx; height: 70rpx; background: #faebee; border-radius: 50%; display: flex; align-items: center; justify-content: center; }.menu { background: #fff; border-radius: 8rpx; padding: 0 22rpx; }.menu-row { display: flex; align-items: center; gap: 20rpx; min-height: 96rpx; border-bottom: 1rpx solid #f1eae8; font-size: 27rpx; }.menu-row text { flex: 1; }.menu-row:last-child { border: 0; }.mine-note { color: #9e9692; text-align: center; font-size: 21rpx; margin-top: 30rpx; }
</style>
