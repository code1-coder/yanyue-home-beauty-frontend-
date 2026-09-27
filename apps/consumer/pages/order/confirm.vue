<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { bookingRepository, catalogRepository, profileRepository } from '../../features/services'
import { go, notice } from '../../shared/navigation'
import DemoNotice from '../../shared/components/DemoNotice.vue'
const draft = bookingRepository.draft()
const project = computed(() => draft ? catalogRepository.project(draft.projectId) : null)
const beautician = computed(() => draft ? catalogRepository.beautician(draft.beauticianId) : null)
const address = computed(() => draft ? profileRepository.address(draft.addressId) : null)
const quote = computed(() => draft ? bookingRepository.quote(draft) : null)
const submitting = shallowRef(false)
const channel = shallowRef<'微信' | '支付宝'>('微信')
// PRD 4.2: Client-side duplicate-tap protection is only a preview safeguard; real creation needs server-side idempotency and atomic occupancy checks.
function submit() { if (submitting.value) return; if (!draft || !quote.value) return notice('预约信息不完整'); submitting.value = true; const order = bookingRepository.create(draft); if (!order) { submitting.value = false; return notice('时段无效，请重新选择') } go('pages/pay/index', { id: order.id, channel: channel.value }) }
</script>
<template>
  <view v-if="draft && quote" class="screen confirm-screen"><DemoNotice />
    <view class="section-title">确认服务</view><view class="service-block"><image :src="`/static/${project?.id === 'p2' ? 'beauty-nails.jpg' : project?.id === 'p3' ? 'beauty-spa.jpg' : 'beauty-facial-new.jpg'}`" mode="aspectFill" /><view><text class="service-name">{{ project?.name }}</text><text class="muted">{{ beautician?.name }} · {{ project?.durationMinutes }}分钟</text><text class="price">¥{{ quote.projectAmount }}</text></view></view>
    <view class="detail-block"><view class="detail-row"><text class="muted">服务时间</text><text>{{ draft.date }} {{ draft.slot }}</text></view><view class="detail-row"><text class="muted">上门地址</text><text>{{ address?.city }} {{ address?.detail }}</text></view><view v-if="draft.note" class="detail-row"><text class="muted">备注</text><text>{{ draft.note }}</text></view></view><view v-if="quote.outsideRadius" class="notice">超出服务半径仍可下单，美容师可以拒单</view>
    <view class="section-title section">金额明细</view><view class="amount-block"><view class="detail-row"><text>项目金额</text><text>¥{{ quote.projectAmount }}</text></view><view class="detail-row"><text>上门费</text><text>¥{{ quote.visitFee }}</text></view><view class="detail-row"><text>优惠券抵扣 <text class="muted">未接入</text></text><text>-¥{{ quote.discount }}</text></view><view class="detail-row total"><text>演示实付</text><text class="price">¥{{ quote.payable }}</text></view></view>
    <view class="section-title section">支付方式</view><view class="channel-block"><view v-for="item in ['微信', '支付宝']" :key="item" class="channel-row" @click="channel = item as typeof channel"><text>{{ item }}支付 <text class="muted">· 演示选择</text></text><text class="radio" :class="{ checked: channel === item }">{{ channel === item ? '✓' : '' }}</text></view></view>
    <view class="guarantee"><u-icon name="lock" size="18" color="#467261" /><text>担保交易：平台先收款，服务完成后结算给美容师。当前仅本地模拟，正式金额与支付由服务端确认。</text></view>
    <view class="fixed-bar"><view><text class="muted">演示实付</text><text class="price">¥{{ quote.payable }}</text></view><button class="submit-button" :disabled="submitting" @click="submit">创建演示订单</button></view>
  </view><view v-else class="screen">预约信息已失效，请返回预约页</view>
</template>
<style scoped>
.confirm-screen { padding-bottom: 185rpx; }.service-block { display: flex; gap: 20rpx; background: #fff; padding: 20rpx; }.service-block image { width: 135rpx; height: 135rpx; border-radius: 6rpx; flex: none; }.service-block > view { display: flex; flex-direction: column; justify-content: space-between; }.service-name { font-size: 30rpx; font-weight: 650; }.detail-block, .amount-block, .channel-block { background: #fff; padding: 5rpx 22rpx; margin-top: 18rpx; }.detail-row { display: flex; justify-content: space-between; gap: 26rpx; padding: 22rpx 0; border-bottom: 1rpx solid #f2eae8; font-size: 26rpx; }.detail-row:last-child { border-bottom: none; }.detail-row > text:last-child { text-align: right; max-width: 70%; }.total { align-items: center; font-weight: 650; }.notice { background: #fff2df; color: #945d32; font-size: 23rpx; padding: 16rpx; margin-top: 14rpx; }.channel-block { margin-top: 0; }.channel-row { display: flex; justify-content: space-between; align-items: center; padding: 25rpx 0; border-bottom: 1rpx solid #f2eae8; }.channel-row:last-child { border: none; }.radio { width: 35rpx; height: 35rpx; border: 2rpx solid #c9c2bf; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 22rpx; }.radio.checked { background: #cf5c6e; border-color: #cf5c6e; }.guarantee { display: flex; gap: 12rpx; line-height: 1.5; color: #557263; font-size: 23rpx; margin: 22rpx 0; }.fixed-bar { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; border-top: 1rpx solid #eee5e3; padding: 16rpx 28rpx calc(16rpx + env(safe-area-inset-bottom)); display: flex; align-items: center; justify-content: space-between; z-index: 10; }.fixed-bar > view { display: flex; flex-direction: column; }.submit-button { margin: 0; width: 280rpx; background: #cf5c6e; color: white; border-radius: 7rpx; font-size: 26rpx; }
</style>
