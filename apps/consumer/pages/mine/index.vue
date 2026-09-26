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
  <view class="screen mine-screen"><DemoNotice /><view class="profile"><view class="profile-avatar">颜</view><view class="profile-info"><text class="profile-name">{{ profile.nickname }}</text><text class="muted">演示账户 · 余额 {{ profile.balanceLabel }}</text></view><text class="profile-link" hover-class="pressed" @click="go('pages/login')">登录 ›</text></view>
    <view class="orders" hover-class="pressed" @click="go('pages/order/list')"><view><text class="orders-title">我的预约</text><text class="muted">查看订单、服务进度与售后</text></view><u-icon name="arrow-right" size="18" color="#999999" /></view>
    <view class="section-label">常用服务</view><view class="shortcut-grid"><u-grid :border="false" col="4"><u-grid-item v-for="item in shortcuts" :key="item.path" @click="go(item.path)"><view class="shortcut"><view class="shortcut-icon"><u-icon :name="item.icon" size="21" color="#a77575" /></view><text>{{ item.label }}</text></view></u-grid-item></u-grid></view>
    <view class="section-label">服务与保障</view><view class="menu"><view v-for="item in supportLinks" :key="item.path" class="menu-row" hover-class="pressed" @click="go(item.path)"><u-icon :name="item.icon" size="21" color="#688f85" /><text>{{ item.label }}</text><u-icon name="arrow-right" size="16" color="#999999" /></view></view>
    <view class="mine-note">上门服务前请核对美容师信息与预约地点</view>
  </view>
</template>
<style scoped>
.mine-screen { padding: 12rpx 24rpx 145rpx; color: #333; }
.profile { display: flex; gap: 20rpx; align-items: center; padding: 30rpx 18rpx 38rpx; border-radius: 16rpx; background: linear-gradient(120deg, #f8eded, #faf7f7 82%); }
.profile-avatar { width: 106rpx; height: 106rpx; flex: none; border-radius: 50%; background: #f3dfe3; color: #a77575; display: flex; align-items: center; justify-content: center; font-size: 42rpx; font-weight: 650; }
.profile-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8rpx; }
.profile-name { font-size: 35rpx; font-weight: 700; }
.profile-link { align-self: flex-start; color: #a77575; font-size: 24rpx; padding: 12rpx; white-space: nowrap; border-radius: 12rpx; }
.orders { background: #fff; display: flex; justify-content: space-between; align-items: center; min-height: 122rpx; box-sizing: border-box; padding: 25rpx 28rpx; border-radius: 16rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.orders > view { display: flex; flex-direction: column; gap: 7rpx; }
.orders-title { font-weight: 650; font-size: 30rpx; }
.section-label { margin: 38rpx 0 17rpx; font-size: 31rpx; font-weight: 650; }
.shortcut-grid { background: #fff; border-radius: 16rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); padding: 26rpx 4rpx; }
.shortcut { width: 100%; min-height: 112rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14rpx; font-size: 22rpx; color: #666; white-space: nowrap; }
.shortcut-icon { width: 62rpx; height: 62rpx; background: #fbf0f2; border: 1rpx solid #efdfe1; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.menu { background: #fff; border-radius: 16rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); padding: 0 24rpx; overflow: hidden; }
.menu-row { display: flex; align-items: center; gap: 24rpx; min-height: 112rpx; border-bottom: 1rpx solid #f1eae8; font-size: 27rpx; color: #666; }
.menu-row text { flex: 1; }
.menu-row:last-child { border: 0; }
.mine-note { color: #999; text-align: center; font-size: 21rpx; margin-top: 32rpx; }
.pressed { background-color: #f1eeee !important; opacity: .84; }
.shortcut-grid :deep(.u-grid-item--hover-class) { background: #f1eeee !important; }
</style>
