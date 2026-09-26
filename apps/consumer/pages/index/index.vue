<script setup lang="ts">
import { shallowRef } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { catalogRepository, profileRepository } from '../../features/services'
import { go } from '../../shared/navigation'
import DemoNotice from '../../shared/components/DemoNotice.vue'
import BeauticianAvatar from '../../shared/components/BeauticianAvatar.vue'
const location = shallowRef({ city: profileRepository.city(), label: profileRepository.locationLabel() })
onShow(() => { location.value = { city: profileRepository.city(), label: profileRepository.locationLabel() } })
const projects = catalogRepository.projects()
const beauticians = catalogRepository.beauticians()
const categories = catalogRepository.categories()
const projectImages: Record<string, string> = { p1: '/static/beauty-facial-new.jpg', p2: '/static/beauty-nails.jpg', p3: '/static/beauty-spa.jpg' }
const banners = ['/static/beauty-spa.jpg', '/static/beauty-facial-new.jpg']
</script>
<template>
  <view class="home">
    <view class="home-header">
      <view class="location" @click="go('pages/location')"><text class="location-label">服务送到</text><view class="location-line"><u-icon name="map" size="19" color="#c75769" /><text class="city">{{ location.city }} · {{ location.label || '选择服务地点' }}</text><u-icon name="arrow-down" size="12" color="#c75769" /></view></view>
      <view class="message" @click="go('pages/message/list')"><u-icon name="bell" size="23" color="#383432" /><text>消息</text></view>
    </view>
    <view class="search" @click="go('pages/search')"><u-icon name="search" size="20" color="#a49c99" /><text>搜索项目、美容师</text><text class="search-command">搜索</text></view>
    <DemoNotice />
    <view class="hero"><u-swiper :list="banners" height="172" :autoplay="true" radius="8" indicator indicator-mode="dot" /><view class="hero-copy"><text class="hero-kicker">颜约到家 · 上门护理</text><text class="hero-title">好好宠爱自己，从家开始</text><text class="hero-subtitle">预约专业美容师，享受自在护理时光</text></view></view>
    <view class="category-area"><u-grid :border="false" col="3"><u-grid-item v-for="(item, index) in categories" :key="item" @click="go('pages/project/list', { category: item })"><view class="category-icon" :class="`category-${index}`"><u-icon :name="['heart', 'star', 'gift'][index]" size="27" :color="['#c25d70', '#ad6b52', '#577c6e'][index]" /></view><text class="category-label">{{ item }}</text></u-grid-item></u-grid></view>
    <view class="service-promise"><text>专业资质已核验</text><text>·</text><text>预约时间可选</text><text>·</text><text>服务送到家</text></view>
    <view class="section-head"><view><text class="heading">为你推荐</text><text class="section-subtitle">从面部到身体，找到适合今天的护理</text></view><text class="more" @click="go('pages/project/list')">全部项目 ›</text></view>
    <view class="project-list"><view v-for="item in projects" :key="item.id" class="project-row" @click="go('pages/project/detail', { id: item.id })"><image class="project-image" :src="projectImages[item.id]" mode="aspectFill" /><view class="project-info"><text class="project-category">{{ item.category }}</text><text class="project-name">{{ item.name }}</text><text class="project-detail">{{ item.description }}</text><view class="project-bottom"><text class="muted">{{ item.durationMinutes }}分钟 · 上门护理</text><text class="price">¥{{ item.price }}</text></view></view></view></view>
    <view class="section-head"><view><text class="heading">人气美容师</text><text class="section-subtitle">看看谁能为你上门服务</text></view><text class="more" @click="go('pages/beautician/list')">查看更多 ›</text></view>
    <scroll-view scroll-x class="expert-scroll"><view class="expert-list"><view v-for="item in beauticians" :key="item.id" class="expert" @click="go('pages/beautician/detail', { id: item.id })"><BeauticianAvatar :name="item.name" /><view class="expert-copy"><text class="expert-name">{{ item.name }} <text class="expert-score">★ {{ item.rating }}</text></text><text class="expert-bio">{{ item.bio }}</text><text class="expert-meta">已服务 {{ item.sales }} 单 · {{ item.distanceKm }}km</text><text class="expert-fee">上门费 ¥{{ item.visitFee }} 起</text></view></view></view></scroll-view>
  </view>
</template>
<style scoped>
.home { padding: 16rpx 24rpx 145rpx; }.home-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18rpx; }
.location { display: flex; flex-direction: column; gap: 3rpx; min-width: 0; max-width: 570rpx; padding: 8rpx 0; }.location-label { color: #968a87; font-size: 21rpx; }.location-line { display: flex; gap: 7rpx; align-items: center; min-width: 0; }.city { font-weight: 700; font-size: 31rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.message { width: 76rpx; display: flex; flex-direction: column; align-items: center; gap: 2rpx; font-size: 19rpx; color: #786e6a; }
.search { height: 78rpx; background: white; border: 1rpx solid #efe4e2; border-radius: 8rpx; display: flex; align-items: center; gap: 16rpx; padding: 0 18rpx; color: #a49c99; font-size: 26rpx; margin-bottom: 20rpx; }.search-command { margin-left: auto; background: #cf5c6e; color: white; font-size: 23rpx; padding: 10rpx 24rpx; border-radius: 6rpx; }
.hero { position: relative; overflow: hidden; border-radius: 8rpx; background: #dbc3bd; min-height: 344rpx; }.hero-copy { position: absolute; left: 0; right: 0; bottom: 0; padding: 20rpx 25rpx 33rpx; color: #34302f; background: rgba(255, 249, 248, .92); pointer-events: none; display: flex; flex-direction: column; gap: 4rpx; }.hero-kicker { font-size: 20rpx; color: #a84f62; }.hero-title { font-size: 31rpx; line-height: 1.25; font-weight: 700; }.hero-subtitle { font-size: 21rpx; color: #675d59; }
.category-area { padding: 25rpx 0 8rpx; background: #fff; margin-top: 18rpx; border-radius: 8rpx; }.category-icon { width: 88rpx; height: 88rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #f9e9ed; margin-bottom: 10rpx; }.category-1 { background: #f8eee4; }.category-2 { background: #eaf2ed; }.category-label { font-size: 24rpx; color: #413b3a; }
.service-promise { display: flex; align-items: center; justify-content: space-around; margin-top: 20rpx; color: #668375; font-size: 20rpx; white-space: nowrap; }
.section-head { display: flex; justify-content: space-between; align-items: end; margin: 38rpx 0 17rpx; }.section-head > view { display: flex; flex-direction: column; gap: 5rpx; min-width: 0; }.heading { font-size: 34rpx; font-weight: 700; }.section-subtitle { color: #928783; font-size: 21rpx; }.more { color: #a45764; font-size: 23rpx; padding: 12rpx 0 5rpx 12rpx; white-space: nowrap; }
.project-list { background: #fff; padding: 0 20rpx; border-radius: 8rpx; }.project-row { display: flex; padding: 20rpx 0; gap: 22rpx; border-bottom: 1rpx solid #f0eae8; }.project-row:last-child { border-bottom: none; }.project-image { width: 180rpx; height: 166rpx; flex: none; border-radius: 6rpx; }.project-info { display: flex; flex: 1; min-width: 0; flex-direction: column; }.project-category { font-size: 20rpx; color: #ae6172; }.project-name { font-size: 30rpx; font-weight: 650; margin: 5rpx 0; }.project-detail { font-size: 22rpx; color: #8d8683; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }.project-bottom { display: flex; justify-content: space-between; align-items: end; margin-top: auto; }.project-bottom .price { font-size: 31rpx; }
.expert-scroll { white-space: nowrap; }.expert-list { display: flex; gap: 16rpx; width: max-content; }.expert { display: flex; gap: 16rpx; align-items: center; width: 525rpx; min-height: 160rpx; background: #fff; padding: 18rpx; border-radius: 8rpx; box-sizing: border-box; }.expert-copy { display: flex; flex-direction: column; min-width: 0; gap: 5rpx; }.expert-name { font-weight: 650; font-size: 27rpx; }.expert-score { color: #c75769; font-size: 22rpx; font-weight: 500; }.expert-bio { font-size: 21rpx; color: #8d8683; overflow: hidden; text-overflow: ellipsis; }.expert-meta { font-size: 20rpx; color: #7b7672; }.expert-fee { font-size: 20rpx; color: #b0646e; }
</style>
