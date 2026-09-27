<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { catalogRepository, orderRepository, profileRepository } from '../../features/services'
import { go, notice } from '../../shared/navigation'
import type { ServiceOrder } from '../../features/services'
import DemoNotice from '../../shared/components/DemoNotice.vue'
import BeauticianAvatar from '../../shared/components/BeauticianAvatar.vue'
const id = shallowRef(''), order = shallowRef<ServiceOrder | undefined>()
onLoad(query => { id.value = query?.id || ''; refresh() })
onShow(refresh)
function refresh() { if (id.value) order.value = orderRepository.byId(id.value) }
const project = computed(() => order.value && catalogRepository.project(order.value.draft.projectId))
const beautician = computed(() => order.value && catalogRepository.beautician(order.value.draft.beauticianId))
const address = computed(() => order.value && profileRepository.address(order.value.draft.addressId))
function cancel() { if (order.value?.status !== '待支付') return notice('取消规则待正式接口确认'); orderRepository.update(id.value, '已取消'); refresh() }
const steps = ['已支付', '待接单', '已接单', '服务中', '已完成', '已结算']
const activeStep = computed(() => {
  const progress: Record<string, number> = { 待接单: 1, 待服务: 2, 服务中: 3, 已完成: 4 }
  return progress[order.value?.status || ''] ?? -1
})
function contact() { notice('演示数据未提供美容师电话') }
function navigate() { notice('演示地址暂不支持导航') }
</script>
<template>
  <view v-if="order" class="screen order-screen"><DemoNotice />
    <view class="status-band"><text class="status-title">{{ order.status }}</text><text class="status-caption">订单 {{ order.id }}</text><text class="status-caption">创建于 {{ order.createdAt.slice(0, 10) }}</text></view>
    <view class="section-title section">订单进度</view><view class="timeline"><view v-for="(step, index) in steps" :key="step" class="timeline-step" :class="{ done: index <= activeStep }"><view class="timeline-dot" /><text>{{ step }}</text></view></view><text class="muted">仅展示本地演示状态；接单、履约与结算需服务端确认。</text>
    <view class="section-title section">服务美容师</view><view class="beautician-row"><BeauticianAvatar :name="beautician?.name || '美'" /><view><text class="strong">{{ beautician?.name }}</text><text class="muted">评分 {{ beautician?.rating }} · 距离 {{ beautician?.distanceKm }}km</text></view><view class="icon-actions"><view @click="contact"><u-icon name="phone" size="22" color="#cf5c6e" /><text>电话</text></view><view @click="navigate"><u-icon name="map" size="22" color="#cf5c6e" /><text>导航</text></view></view></view>
    <view class="section-title section">服务信息</view><view class="info-block"><view class="info-row"><text class="muted">服务项目</text><text>{{ project?.name }}</text></view><view class="info-row"><text class="muted">预约时间</text><text>{{ order.draft.date }} {{ order.draft.slot }}</text></view><view class="info-row"><text class="muted">上门地址</text><text>{{ address?.city }} {{ address?.detail }}</text></view></view>
    <view class="section-title section">金额明细</view><view class="info-block"><view class="info-row"><text>项目实付</text><text>¥{{ order.quote.projectAmount }}</text></view><view class="info-row"><text>上门费</text><text>¥{{ order.quote.visitFee }}</text></view><view class="info-row"><text>优惠</text><text>-¥{{ order.quote.discount }}</text></view><view class="info-row total"><text>演示实付</text><text class="price">¥{{ order.quote.payable }}</text></view></view>
    <view class="actions"><button v-if="order.status === '待支付'" class="action" @click="go('pages/pay/index', { id })">继续模拟支付</button><button v-if="order.status === '待支付'" class="secondary" @click="cancel">取消演示订单</button><button v-if="['待接单', '待服务', '服务中', '已完成'].includes(order.status)" class="secondary" @click="go('pages/order/refund', { id })">申请退款 / 售后</button><button v-if="order.status === '已完成' && !order.review" class="action" @click="go('pages/order/comment', { id })">评价服务</button></view>
  </view><view v-else class="screen">订单不存在</view>
</template>
<style scoped>
.status-band { background: #f8e8e9; padding: 32rpx 28rpx; display: flex; flex-direction: column; gap: 12rpx; border-radius: 6rpx; }.status-title { color: #ae4d5d; font-size: 40rpx; font-weight: 700; }.status-caption { font-size: 23rpx; color: #8d7374; }.timeline { display: flex; justify-content: space-between; margin: 18rpx 0; }.timeline-step { width: 16%; display: flex; align-items: center; flex-direction: column; gap: 12rpx; text-align: center; color: #ada6a2; font-size: 19rpx; }.timeline-step.done { color: #b65364; }.timeline-dot { width: 18rpx; height: 18rpx; border-radius: 50%; background: #d8d1ce; }.done .timeline-dot { background: #cf5c6e; }.beautician-row { display: flex; align-items: center; gap: 17rpx; background: #fff; padding: 18rpx; }.beautician-row image { width: 100rpx; height: 100rpx; border-radius: 6rpx; flex: none; }.beautician-row > view:nth-child(2) { display: flex; flex-direction: column; gap: 8rpx; flex: 1; }.strong { font-weight: 650; }.icon-actions { display: flex; gap: 18rpx; }.icon-actions > view { display: flex; flex-direction: column; align-items: center; gap: 4rpx; color: #9d5763; font-size: 19rpx; }.info-block { background: #fff; padding: 4rpx 20rpx; }.info-row { display: flex; justify-content: space-between; gap: 25rpx; padding: 22rpx 0; border-bottom: 1rpx solid #f0e9e7; font-size: 25rpx; }.info-row:last-child { border: none; }.info-row > text:last-child { text-align: right; max-width: 70%; }.total { font-weight: 650; }.actions { margin-top: 30rpx; }
</style>
