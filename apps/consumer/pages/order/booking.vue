<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { bookingRepository, catalogRepository, profileRepository } from '../../features/services'
import { go, notice } from '../../shared/navigation'
import type { BookingDraft } from '../../features/services'
import DemoNotice from '../../shared/components/DemoNotice.vue'
const projectId = shallowRef(''), beauticianId = shallowRef(''), date = shallowRef(''), slot = shallowRef(''), addressId = shallowRef(''), note = shallowRef('')
onLoad(query => {
  const saved = bookingRepository.draft()
  projectId.value = query?.projectId || saved?.projectId || ''
  beauticianId.value = query?.beauticianId || saved?.beauticianId || ''
  if (saved?.projectId === projectId.value && saved.beauticianId === beauticianId.value) { date.value = saved.date; slot.value = saved.slot; addressId.value = saved.addressId; note.value = saved.note }
})
onShow(() => { addressId.value = bookingRepository.draft()?.addressId || addressId.value || profileRepository.addresses().find(item => item.isDefault)?.id || '' })
const project = computed(() => catalogRepository.project(projectId.value))
const beautician = computed(() => catalogRepository.beautician(beauticianId.value))
const address = computed(() => profileRepository.address(addressId.value))
const dates = Array.from({ length: 7 }, (_, i) => { const day = new Date(); day.setDate(day.getDate() + i + 1); return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}` })
const slots = bookingRepository.slots()
const slotState = bookingRepository.slotState
const quote = computed(() => project.value && beautician.value ? project.value.price + beautician.value.visitFee : 0)
const draft = (): BookingDraft => ({ projectId: projectId.value, beauticianId: beauticianId.value, date: date.value, slot: slot.value, addressId: addressId.value, note: note.value })
function chooseAddress() { bookingRepository.setDraft(draft()); go('pages/address/list', { select: '1' }) }
function next() { if (!date.value || !slot.value || !addressId.value) return notice('请选择日期、时段和地址'); if (slotState(slot.value) !== '可约') return notice('该时段不可约，请重新选择'); bookingRepository.setDraft(draft()); go('pages/order/confirm') }
</script>
<template>
  <view v-if="project && beautician" class="screen booking-screen">
    <DemoNotice />
    <view class="project-summary"><image class="project-image" :src="`/static/${project.id === 'p2' ? 'beauty-nails.jpg' : project.id === 'p3' ? 'beauty-spa.jpg' : 'beauty-facial-new.jpg'}`" mode="aspectFill" /><view><text class="project-name">{{ project.name }}</text><text class="muted">{{ beautician.name }} · {{ project.durationMinutes }}分钟</text><text class="price">¥{{ project.price }}</text></view></view>
    <view class="section-title section">选择日期</view><scroll-view scroll-x class="date-scroll"><view class="date-list"><view v-for="item in dates" :key="item" class="date-item" :class="{ active: date === item }" @click="date = item; slot = ''"><text>{{ item.slice(5) }}</text><text class="date-week">{{ item === dates[0] ? '明天' : '可预约' }}</text></view></view></scroll-view>
    <view class="section-title section">选择上门时间</view><view class="slot-grid"><view v-for="item in slots" :key="item" class="slot-item" :class="{ active: slot === item, unavailable: slotState(item) !== '可约' }" @click="slotState(item) === '可约' && (slot = item)"><text>{{ item }}</text><text class="slot-label">{{ slotState(item) }}</text></view></view><text class="muted slot-help">半小时段仅为演示候选；正式可约性包含服务时长与前后缓冲，由服务端确认</text>
    <view class="section-title section">上门地址</view><view class="address-row" @click="chooseAddress"><u-icon name="map" size="23" color="#cf5c6e" /><text>{{ address ? `${address.city} ${address.detail}` : '请选择或新增地址' }}</text><text class="arrow">›</text></view>
    <view class="fee-row"><text>上门费 <text class="muted">· {{ beautician.distanceKm }}km</text></text><text>¥{{ beautician.visitFee }}</text></view><view v-if="beautician.distanceKm > beautician.radiusKm" class="notice">超出服务半径仍可下单，美容师可以拒单</view>
    <view class="section-title section">服务备注</view><textarea v-model="note" class="note" placeholder="如有过敏史或特殊需求，请提前告知（选填）" />
    <view class="fixed-bar"><view><text class="muted">演示合计</text><text class="price">¥{{ quote }}</text></view><button class="next-button" @click="next">去确认订单</button></view>
  </view><view v-else class="screen">请先选择项目和美容师</view>
</template>
<style scoped>
.booking-screen { padding-bottom: 185rpx; }.project-summary { display: flex; gap: 22rpx; background: #fff; padding: 20rpx; border-radius: 8rpx; }.project-image { width: 150rpx; height: 150rpx; border-radius: 6rpx; flex: none; }.project-summary > view { display: flex; flex-direction: column; justify-content: space-between; }.project-name { font-weight: 650; font-size: 30rpx; }.date-scroll { white-space: nowrap; }.date-list { display: flex; gap: 12rpx; width: max-content; }.date-item { width: 108rpx; height: 105rpx; background: #fff; border: 1rpx solid #f0e5e3; border-radius: 6rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8rpx; box-sizing: border-box; }.date-week { font-size: 21rpx; color: #99908d; }.date-item.active, .slot-item.active { background: #cf5c6e; color: #fff; border-color: #cf5c6e; }.date-item.active .date-week, .slot-item.active .slot-label { color: #fff; }.slot-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12rpx; }.slot-item { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 104rpx; gap: 5rpx; border: 1rpx solid #eee5e3; border-radius: 6rpx; background: #fff; font-size: 26rpx; }.slot-label { font-size: 20rpx; color: #698578; }.slot-item.unavailable { background: #f1efee; color: #aaa4a1; }.slot-item.unavailable .slot-label { color: #aaa4a1; }.slot-help { display: block; line-height: 1.5; margin-top: 15rpx; }.address-row { display: flex; gap: 14rpx; align-items: center; background: #fff; padding: 24rpx 20rpx; border-radius: 6rpx; }.address-row > text:nth-child(2) { flex: 1; font-size: 25rpx; }.arrow { color: #a59a98; }.fee-row { display: flex; justify-content: space-between; padding: 25rpx 2rpx; border-bottom: 1rpx solid #eee5e3; }.notice { background: #fff2df; color: #945d32; font-size: 23rpx; padding: 14rpx; }.note { box-sizing: border-box; width: 100%; height: 135rpx; padding: 20rpx; background: #fff; font-size: 25rpx; border-radius: 6rpx; }.fixed-bar { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; border-top: 1rpx solid #eee5e3; padding: 16rpx 28rpx calc(16rpx + env(safe-area-inset-bottom)); display: flex; align-items: center; justify-content: space-between; z-index: 10; }.fixed-bar > view { display: flex; flex-direction: column; }.next-button { margin: 0; width: 270rpx; background: #cf5c6e; color: #fff; border-radius: 7rpx; font-size: 27rpx; }
</style>
