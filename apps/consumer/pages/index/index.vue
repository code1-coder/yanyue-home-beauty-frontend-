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
const requiredQualifications = ['实名已验', '健康证已验', '美容师证已验']
function isFullyVerified(qualifications: string[]) { return requiredQualifications.every(label => qualifications.includes(label)) }
</script>
<template>
  <view class="home">
    <view class="home-header">
      <view class="location" hover-class="pressed" @click="go('pages/location')"><text class="location-label">服务送到</text><view class="location-line"><u-icon name="map" size="19" color="#a77575" /><text class="city">{{ location.city }} · {{ location.label || '选择服务地点' }}</text><u-icon name="arrow-down" size="12" color="#a77575" /></view></view>
      <view class="message" hover-class="pressed" @click="go('pages/message/list')"><u-icon name="bell" size="23" color="#666666" /><text>消息</text></view>
    </view>
    <view class="search" hover-class="pressed" @click="go('pages/search')"><u-icon name="search" size="20" color="#999999" /><text>搜索项目、美容师</text><text class="search-command">搜索</text></view>
    <DemoNotice />
    <!-- The copy stays above the unchanged demo photos; the gradient protects contrast. -->
    <view class="hero"><u-swiper :list="banners" height="172" :autoplay="true" radius="8" indicator indicator-mode="dot" /><view class="hero-copy"><text class="hero-kicker">轻龄到家 · 上门护理</text><text class="hero-title">好好宠爱自己，从家开始</text><text class="hero-subtitle">预约专业美容师，享受自在护理时光</text></view></view>
    <view class="category-area"><u-grid :border="false" col="3"><u-grid-item v-for="(item, index) in categories" :key="item" @click="go('pages/project/list', { category: item })"><view class="category-tile"><view class="category-icon" :class="`category-${index}`"><u-icon :name="['heart', 'star', 'gift'][index]" size="25" :color="['#b98383', '#a98677', '#688f85'][index]" /></view><text class="category-label">{{ item }}</text></view></u-grid-item></u-grid></view>
    <view class="service-promise"><text>专业资质已核验</text><text>·</text><text>预约时间可选</text><text>·</text><text>服务送到家</text></view>
    <view class="section-head"><view><text class="heading">为你推荐</text><text class="section-subtitle">从面部到身体，找到适合今天的护理</text></view><text class="more" hover-class="pressed" @click="go('pages/project/list')">全部项目 ›</text></view>
    <view class="project-list"><view v-for="item in projects" :key="item.id" class="project-touch" hover-class="pressed"><u-card :show-head="false" :show-foot="false" :border="false" margin="0" padding="0" border-radius="16rpx" box-shadow="0 2rpx 12rpx rgba(0,0,0,0.04)" @click="go('pages/project/detail', { id: item.id })"><template #body><view class="project-row"><image class="project-image" :src="projectImages[item.id]" mode="aspectFill" /><view class="project-info"><text class="project-category">{{ item.category }}</text><text class="project-name">{{ item.name }}</text><text class="project-detail">{{ item.description }}</text><view class="project-bottom"><text class="muted">{{ item.durationMinutes }}分钟 · 上门护理</text><text class="price">¥{{ item.price }}</text></view></view></view></template></u-card></view></view>
    <view class="section-head"><view><text class="heading">人气美容师</text><text class="section-subtitle">看看谁能为你上门服务</text></view><text class="more" hover-class="pressed" @click="go('pages/beautician/list')">查看更多 ›</text></view>
    <scroll-view scroll-x class="expert-scroll"><view class="expert-list"><view v-for="item in beauticians" :key="item.id" class="expert" hover-class="pressed" @click="go('pages/beautician/detail', { id: item.id })"><BeauticianAvatar :name="item.name" /><view class="expert-copy"><view class="expert-heading"><text class="expert-name">{{ item.name }}</text><text class="expert-score">☆ {{ item.rating }}</text></view><text class="expert-bio">{{ item.bio }}</text><text class="expert-meta">已服务 {{ item.sales }} 单 · {{ item.distanceKm }}km</text><view class="expert-footer"><text class="expert-fee">上门费 ¥{{ item.visitFee }} 起</text><text v-if="isFullyVerified(item.qualifications)" class="verified">三证已核验</text></view></view></view></view></scroll-view>
  </view>
</template>
<style scoped>
.home { padding: 16rpx 24rpx 145rpx; color: #333; }
.home-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18rpx; }
.location { display: flex; flex-direction: column; gap: 3rpx; min-width: 0; max-width: 570rpx; padding: 8rpx 0; }
.location-label { color: #999; font-size: 21rpx; }
.location-line { display: flex; gap: 7rpx; align-items: center; min-width: 0; }
.city { font-weight: 700; font-size: 31rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.message { width: 76rpx; min-height: 76rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2rpx; font-size: 19rpx; color: #999; }
.search { height: 78rpx; background: #fff; border: 1rpx solid #efe4e2; border-radius: 24rpx; display: flex; align-items: center; gap: 16rpx; padding: 0 12rpx 0 20rpx; color: #999; font-size: 23rpx; margin-bottom: 20rpx; }
.search-command { margin-left: auto; background: #d9a4a4; color: #fff; font-size: 23rpx; padding: 10rpx 24rpx; border-radius: 24rpx; }
.hero { position: relative; overflow: hidden; border-radius: 16rpx; background: #dbc3bd; height: 344rpx; }
.hero-copy { position: absolute; left: 0; right: 0; bottom: 0; height: 196rpx; padding: 0 28rpx 38rpx; box-sizing: border-box; background: linear-gradient(transparent, rgba(32, 27, 30, .68)); color: #fff; pointer-events: none; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 5rpx; text-align: center; }
.hero-kicker { font-size: 20rpx; color: #fff; }
.hero-title { font-size: 31rpx; line-height: 1.35; font-weight: 700; }
.hero-subtitle { font-size: 21rpx; line-height: 1.4; color: #fff; }
.category-area { padding: 25rpx 0 20rpx; background: #fff; margin-top: 18rpx; border-radius: 16rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.category-tile { width: 100%; min-height: 134rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16rpx; }
.category-icon { width: 86rpx; height: 86rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #fcf6f6; border: 1rpx solid #ecd3d3; }
.category-1 { background: #faf7f3; border-color: #e8d9cf; }
.category-2 { background: #f5f9f7; border-color: #b8d8d0; }
.category-label { font-size: 24rpx; color: #666; text-align: center; }
.service-promise { display: flex; align-items: center; justify-content: space-around; margin-top: 20rpx; color: #688f85; font-size: 20rpx; white-space: nowrap; }
.section-head { display: flex; justify-content: space-between; align-items: flex-end; margin: 38rpx 0 17rpx; }
.section-head > view { display: flex; flex-direction: column; gap: 5rpx; min-width: 0; }
.heading { font-size: 34rpx; font-weight: 700; }
.section-subtitle { color: #999; font-size: 21rpx; }
.more { color: #a77575; font-size: 23rpx; padding: 12rpx 0 5rpx 12rpx; white-space: nowrap; }
.project-list { display: flex; flex-direction: column; gap: 16rpx; }
.project-touch { border-radius: 16rpx; overflow: hidden; }
.project-row { display: flex; padding: 20rpx; gap: 22rpx; min-height: 166rpx; }
.project-image { width: 180rpx; height: 166rpx; flex: none; border-radius: 12rpx; }
.project-info { display: flex; flex: 1; min-width: 0; flex-direction: column; }
.project-category { font-size: 20rpx; color: #a77575; }
.project-name { font-size: 30rpx; font-weight: 650; margin: 5rpx 0; }
.project-detail { font-size: 21rpx; color: #999; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.project-bottom { display: flex; justify-content: space-between; align-items: flex-end; gap: 8rpx; margin-top: auto; }
.project-bottom .muted { font-size: 20rpx; white-space: nowrap; }
.project-bottom .price { margin-left: auto; font-size: 35rpx; white-space: nowrap; }
.expert-scroll { white-space: nowrap; }
.expert-list { display: flex; gap: 24rpx; width: max-content; padding-bottom: 8rpx; }
.expert { display: flex; gap: 16rpx; align-items: flex-start; width: 550rpx; min-height: 186rpx; background: #fff; padding: 20rpx; border-radius: 16rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); box-sizing: border-box; }
.expert-copy { display: flex; flex: 1; flex-direction: column; min-width: 0; gap: 7rpx; }
.expert-heading, .expert-footer { display: flex; align-items: center; justify-content: space-between; gap: 8rpx; }
.expert-name { font-weight: 650; font-size: 27rpx; }
.expert-score { color: #d9a4a4; font-size: 22rpx; font-weight: 600; }
.expert-bio { font-size: 21rpx; color: #999; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.expert-meta { font-size: 20rpx; color: #666; }
.expert-fee { font-size: 20rpx; color: #a77575; }
.verified { color: #688f85; background: #f2f8f5; border: 1rpx solid #b8d8d0; border-radius: 8rpx; font-size: 18rpx; padding: 3rpx 7rpx; white-space: nowrap; }
.pressed { background-color: #f1eeee !important; opacity: .84; }
.category-area :deep(.u-grid-item--hover-class) { background: #f1eeee !important; }
</style>
