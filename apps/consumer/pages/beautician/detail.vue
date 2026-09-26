<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { catalogRepository, bookingRepository } from '../../features/services'
import { go } from '../../shared/navigation'
import DemoNotice from '../../shared/components/DemoNotice.vue'
import BeauticianAvatar from '../../shared/components/BeauticianAvatar.vue'
const id = shallowRef('')
const selectedProject = shallowRef('')
onLoad(query => { id.value = query?.id || ''; selectedProject.value = query?.projectId || '' })
const beautician = computed(() => catalogRepository.beautician(id.value))
const projects = computed(() => catalogRepository.projects().filter(item => beautician.value?.projectIds.includes(item.id)))
const slots = bookingRepository.slots().slice(0, 4)
const dates = Array.from({ length: 7 }, (_, i) => { const day = new Date(); day.setDate(day.getDate() + i + 1); return `${day.getMonth() + 1}月${day.getDate()}日` })
const selectedDate = shallowRef(0)
</script>
<template>
  <view v-if="beautician" class="screen detail-screen">
    <DemoNotice />
    <view class="profile"><BeauticianAvatar :name="beautician.name" size="large" /><view class="profile-copy"><text class="profile-name">{{ beautician.name }}</text><text class="muted">{{ beautician.bio }}</text><text class="score">★ {{ beautician.rating }} <text class="muted">· 已服务 {{ beautician.sales }} 单 · {{ beautician.distanceKm }}km</text></text><text class="muted">头像与资质信息仅供演示</text></view></view>
    <view class="verified"><text v-for="item in beautician.qualifications" :key="item" class="verified-item">✓ {{ item }}</text></view>
    <view class="section-title section">服务信息</view>
    <view class="info-grid"><view><text class="info-value">{{ beautician.radiusKm }}km</text><text class="muted">服务半径</text></view><view><text class="info-value">¥{{ beautician.visitFee }}</text><text class="muted">演示上门费</text></view></view>
    <view v-if="beautician.distanceKm > beautician.radiusKm" class="notice">当前距离超出服务半径，仍可下单，美容师可以拒单</view>
    <view class="section-title section">擅长项目</view><view class="project-list"><view v-for="item in projects" :key="item.id" class="project-option" :class="{ active: selectedProject === item.id }" @click="selectedProject = item.id"><view><text class="option-name">{{ item.name }}</text><text class="muted">{{ item.durationMinutes }}分钟 · {{ item.category }}</text></view><text class="price">¥{{ item.price }}</text></view></view>
    <view class="section-title section">近期可约</view><scroll-view scroll-x><view class="date-list"><text v-for="(item, index) in dates" :key="item" class="date-item" :class="{ active: selectedDate === index }" @click="selectedDate = index">{{ item }}</text></view></scroll-view><view class="slot-list"><text v-for="slot in slots" :key="slot" class="slot-item" :class="{ unavailable: bookingRepository.slotState(slot) !== '可约' }">{{ slot }} {{ bookingRepository.slotState(slot) }}</text></view><text class="muted">展示时段仅供预览；预约页选择后仍需服务端校验</text>
    <view class="section-title section">顾客评价</view><view class="review"><text class="score">★★★★★</text><text class="review-title">细致、准时的护理体验</text><text class="muted">演示评价 · 实际评价需接入服务端</text></view>
    <view class="fixed-bar"><text class="muted">{{ selectedProject ? '已选服务' : '请先选择服务项目' }}</text><button class="book-button" :disabled="!selectedProject" @click="go('pages/order/booking', { projectId: selectedProject, beauticianId: id })">立即预约</button></view>
  </view><view v-else class="screen">美容师不存在</view>
</template>
<style scoped>
.detail-screen { padding-bottom: 175rpx; }.profile { display: flex; gap: 24rpx; align-items: center; }.profile-copy { display: flex; flex-direction: column; gap: 12rpx; min-width: 0; }.profile-name { font-size: 40rpx; font-weight: 700; }.score { color: #c45b68; font-weight: 650; }.verified { display: flex; flex-wrap: wrap; gap: 12rpx; margin-top: 26rpx; }.verified-item { background: #eaf2ed; color: #416e5b; padding: 10rpx 14rpx; border-radius: 5rpx; font-size: 21rpx; }.info-grid { display: flex; gap: 70rpx; padding: 24rpx 0; border-top: 1rpx solid #eee6e4; border-bottom: 1rpx solid #eee6e4; }.info-grid > view { display: flex; flex-direction: column; gap: 7rpx; }.info-value { font-size: 32rpx; font-weight: 650; }.notice { color: #945d32; background: #fff2df; padding: 16rpx; margin-top: 20rpx; font-size: 23rpx; }.project-list { background: #fff; padding: 0 20rpx; }.project-option { display: flex; justify-content: space-between; align-items: center; padding: 22rpx 5rpx; border-bottom: 1rpx solid #f1eae8; }.project-option:last-child { border-bottom: none; }.project-option.active { color: #bd5264; }.project-option > view { display: flex; flex-direction: column; gap: 9rpx; }.option-name { font-weight: 650; }.date-list { display: flex; gap: 10rpx; width: max-content; }.date-item, .slot-item { padding: 15rpx 18rpx; background: #fff; border: 1rpx solid #eee6e4; border-radius: 6rpx; font-size: 24rpx; }.date-item.active { background: #cf5c6e; border-color: #cf5c6e; color: #fff; }.slot-list { display: flex; gap: 12rpx; margin: 18rpx 0 12rpx; flex-wrap: wrap; }.slot-item.unavailable { background: #f0eeed; color: #aaa19e; }.review { display: flex; flex-direction: column; gap: 12rpx; padding: 24rpx 0; border-top: 1rpx solid #eee6e4; }.review-title { font-weight: 600; }.fixed-bar { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; border-top: 1rpx solid #eee6e4; padding: 18rpx 28rpx calc(18rpx + env(safe-area-inset-bottom)); display: flex; align-items: center; justify-content: space-between; z-index: 10; }.book-button { margin: 0; width: 270rpx; background: #cf5c6e; color: #fff; border-radius: 7rpx; font-size: 27rpx; }
</style>
