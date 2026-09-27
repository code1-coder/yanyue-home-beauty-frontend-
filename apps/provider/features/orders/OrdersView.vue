<script setup lang="ts">
import { computed, onMounted, reactive, shallowRef, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { services } from '../services'
import type { OrderStatus, ServiceOrder } from '../types'
import { go, run, toast } from '../../shared/navigation'
import { callPhone, navigate, selectImage } from '../../platform/media'
import DemoBanner from '../../shared/components/DemoBanner.vue'
import RejectDialog from './RejectDialog.vue'
const props = defineProps<{ mode: 'list' | 'detail' | 'upload'; id?: string; refreshKey?: number }>()
const statuses: Array<'全部' | OrderStatus> = ['全部', '待接单', '待服务', '服务中', '已完成', '已取消']
const tab = shallowRef<(typeof statuses)[number]>('全部'), list = shallowRef<ServiceOrder[]>([]), detail = shallowRef<ServiceOrder>(), rejectOpen = shallowRef(false)
const radiusKm = shallowRef(0)
const proof = reactive({ before: '', after: '', note: '' })
const visible = computed(() => tab.value === '全部' ? list.value : list.value.filter(o => o.status === tab.value))
const progress = ['待接单', '待服务', '服务中', '已完成'] as const
const step = computed(() => progress.findIndex(status => status === detail.value?.status))
async function refresh() { list.value = await services.orders.list(); radiusKm.value = (await services.profile.get()).radiusKm; if (props.id) { detail.value = await services.orders.detail(props.id); Object.assign(proof, detail.value?.proof || { before: '', after: '', note: '' }) } }
onShow(refresh)
onMounted(refresh)
watch(() => props.id, refresh)
watch(() => props.refreshKey, refresh)
async function change(action: () => Promise<void>, label: string) { if (await run(action, label)) refresh() }
async function reject(reason: string) { if (!props.id) return; if (await run(() => services.orders.reject(props.id!, reason), '已拒单')) { rejectOpen.value = false; refresh() } }
async function pick(field: 'before' | 'after') { try { proof[field] = await selectImage() } catch { toast('未选择图片') } }
async function upload() { if (!props.id) return; if (await run(() => services.orders.uploadProof(props.id!, proof), '凭证已保存')) go('pages/order/detail', { id: props.id }) }
</script>
<template><view class="screen" :class="{ 'tab-screen': mode === 'list' }"><DemoBanner />
  <template v-if="mode === 'list'"><text class="page-heading">服务订单</text><scroll-view scroll-x><view class="tabs"><view v-for="status in statuses" :key="status" class="chip" :class="{ active: tab === status }" @click="tab = status">{{ status }}</view></view></scroll-view><view v-for="item in visible" :key="item.id" class="panel order-card" @click="go('pages/order/detail', { id: item.id })"><view class="row"><text class="order-name">{{ item.project }}</text><text class="tag" :class="{ pending: item.status === '待接单', 'active-status': item.status === '服务中', complete: item.status === '已完成', cancelled: item.status === '已取消' }">{{ item.status }}</text></view><text class="muted">{{ item.date }} {{ item.time }} · {{ item.customer }}</text><text class="muted address">{{ item.address }}</text><text class="money order-amount">¥{{ item.income }}</text></view><view v-if="!visible.length" class="empty">暂无此状态订单</view></template>
  <template v-else-if="detail"><view class="status-panel"><view class="row"><text class="hero-title">{{ detail.status }}</text><text class="muted">{{ detail.id }}</text></view><view class="progress"><view v-for="(status, index) in progress" :key="status" class="progress-step" :class="{ reached: step >= index }"><view class="progress-dot"/><text>{{ status }}</text></view></view></view><template v-if="mode === 'detail'"><text class="section-title">客户信息</text><view class="panel stack"><view class="row"><view class="customer row"><view class="customer-avatar">{{ detail.customer.slice(0, 1) }}</view><text class="order-name">{{ detail.customer }}</text></view><button size="mini" @click="callPhone(detail.phone)">联系用户</button></view><text class="muted">{{ detail.phone }}</text><view class="row"><text class="address">{{ detail.address }}</text><button size="mini" @click="navigate(detail!.latitude, detail!.longitude, detail!.customer, detail!.address)">导航</button></view><text class="muted">距离 {{ detail.distanceKm }} km</text><text v-if="detail.distanceKm > radiusKm" class="danger">此演示订单可能超出服务范围，仍可选择接单或拒单。</text></view><text class="section-title">服务信息</text><view class="panel detail-lines"><view class="row"><text class="muted">服务项目</text><text>{{ detail.project }}</text></view><view class="row"><text class="muted">服务时长</text><text>{{ detail.duration }} 分钟</text></view><view class="row"><text class="muted">预约时段</text><text>{{ detail.date }} {{ detail.time }}</text></view><view class="row"><text class="muted">客户备注</text><text>{{ detail.note }}</text></view></view><text class="section-title">金额明细</text><view class="panel detail-lines"><view class="row"><text class="muted">实付金额</text><text>¥{{ detail.paid }}</text></view><view class="row"><text class="muted">上门费（已含在实付中）</text><text>¥{{ detail.visitFee }}</text></view><view class="row"><text class="muted">优惠分摊</text><text>¥{{ detail.discount }}</text></view><view class="row"><text class="muted">平台抽成（快照 {{ detail.commissionRateSnapshot * 100 }}%）</text><text>−¥{{ detail.commission }}</text></view><view class="row income-row"><text>预计收入</text><text class="money">¥{{ detail.income }}</text></view><text class="muted">金额及退款冲正以服务端结算为准。</text></view><view v-if="detail.proof" class="panel">凭证已上传 · {{ detail.proof.note || '无备注' }}</view><view v-if="detail.rejectionReason" class="panel danger">拒单原因：{{ detail.rejectionReason }}</view><view class="order-actions"><button v-if="detail.status === '待接单'" class="action" @click="change(() => services.orders.accept(detail!.id), '接单成功')">接单</button><button v-if="detail.status === '待接单'" class="secondary" @click="rejectOpen = true">拒单</button><button v-if="detail.status === '待服务'" class="action" @click="change(() => services.orders.start(detail!.id), '服务已开始')">开始服务</button><button v-if="detail.status === '服务中'" class="secondary" @click="go('pages/order/upload', { id: detail!.id })">{{ detail.proof ? '查看 / 更换凭证' : '上传服务凭证' }}</button><button v-if="detail.status === '服务中'" class="action" @click="change(() => services.orders.complete(detail!.id), '服务完成')">完成服务</button></view><RejectDialog :visible="rejectOpen" @close="rejectOpen = false" @confirm="reject"/></template>
  <template v-else><text class="section-title">服务前后照片</text><view class="panel stack"><view class="row"><text>服务前</text><button size="mini" @click="pick('before')">{{ proof.before ? '已选择 · 更换' : '选择图片' }}</button></view><image v-if="proof.before" :src="proof.before" class="preview" mode="aspectFill"/><view class="row"><text>服务后</text><button size="mini" @click="pick('after')">{{ proof.after ? '已选择 · 更换' : '选择图片' }}</button></view><image v-if="proof.after" :src="proof.after" class="preview" mode="aspectFill"/><label class="field">服务备注<textarea v-model="proof.note" placeholder="记录本次服务情况"/></label></view><button class="action" @click="upload">保存凭证</button></template></template><view v-else class="empty">订单不存在</view>
</view></template>
<style scoped>
.page-heading { display: block; font-size: 36rpx; font-weight: 700; margin: 8rpx 0 24rpx; color: #292F2C; }
.tabs { display: flex; gap: 12rpx; width: max-content; padding: 2rpx 2rpx 8rpx; margin-bottom: 16rpx; }
.order-card { display: flex; flex-direction: column; gap: 12rpx; }
.order-card:active { opacity: .86; transform: scale(.99); }
.order-card .row { align-items: flex-start; }
.order-name { flex: 1; min-width: 0; font-weight: 650; color: #292F2C; overflow-wrap: anywhere; }
.address { overflow-wrap: anywhere; }
.order-amount { align-self: flex-end; font-size: 34rpx; line-height: 1.2; color: #386C5D; }
.status-panel { background: #E6F2EF; border-radius: 24rpx; padding: 32rpx; }
.progress { display: flex; margin-top: 28rpx; }
.progress-step { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; color: #999; font-size: 20rpx; text-align: center; position: relative; }
.progress-step:not(:last-child)::after { content: ''; position: absolute; top: 10rpx; left: 50%; width: 100%; height: 2rpx; background: #C9D9D4; }
.progress-step.reached { color: #2A594F; }
.progress-dot { width: 20rpx; height: 20rpx; border-radius: 50%; background: #C9D9D4; z-index: 1; margin-bottom: 12rpx; }
.reached .progress-dot { background: #2A594F; }
.customer { justify-content: flex-start; }
.customer-avatar { width: 64rpx; height: 64rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #E6F2EF; color: #2A594F; }
.detail-lines { display: flex; flex-direction: column; gap: 24rpx; }
.detail-lines .row { align-items: flex-start; }
.detail-lines .row > text:last-child { text-align: right; overflow-wrap: anywhere; }
.income-row { border-top: 1rpx solid #EEE; padding-top: 24rpx; font-weight: 600; }
.income-row .money { font-size: 36rpx; }
.order-actions { display: flex; gap: 16rpx; }
.order-actions button { flex: 1; min-width: 0; }
.preview { width: 140rpx; height: 140rpx; border-radius: 12rpx; }
</style>
