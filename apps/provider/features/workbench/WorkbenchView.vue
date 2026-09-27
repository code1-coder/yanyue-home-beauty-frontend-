<script setup lang="ts">
import { onMounted, shallowRef, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { services } from '../services'
import type { Provider, ServiceOrder } from '../types'
import { go, run, switchValue } from '../../shared/navigation'
import DemoBanner from '../../shared/components/DemoBanner.vue'
const props = defineProps<{ refreshKey?: number }>()
const summary = shallowRef<Awaited<ReturnType<typeof services.workbench.summary>>>()
const recent = shallowRef<ServiceOrder[]>([])
const provider = shallowRef<Provider>()
const monthIncome = shallowRef(0)
async function refresh() { summary.value = await services.workbench.summary(); recent.value = (await services.orders.list()).slice(0, 3); provider.value = await services.profile.get(); monthIncome.value = (await services.finance.wallet()).month }
onShow(refresh)
onMounted(refresh)
watch(() => props.refreshKey, refresh)
async function toggle(value: boolean) { await run(() => services.workbench.setAccepting(value), value ? '已开启接单' : '已暂停接单'); await refresh() }
</script>
  <template><view class="screen tab-screen"><DemoBanner /><view class="identity row"><view class="person row"><image v-if="provider?.avatar" :src="provider.avatar" class="avatar" mode="aspectFill"/><view v-else class="avatar avatar-fallback">{{ provider?.nickname?.slice(0, 1) || '颜' }}</view><view class="person-copy"><text class="hero-title">{{ provider?.nickname || '服务者' }}</text><text class="identity-tag">{{ summary?.eligible ? '资质已核验' : '资质待审核或已到期' }}</text></view></view><view class="header-actions"><view class="toggle"><text class="toggle-label">接单状态</text><switch :checked="summary?.accepting" color="#76A494" @change="toggle(switchValue($event))"/><text class="toggle-status" :class="{ accepting: summary?.accepting }">{{ summary?.accepting ? '接单中' : '已暂停' }}</text></view><view class="message-link" role="button" aria-label="消息中心" @click="go('pages/message/list')"><u-icon name="bell" size="22" color="#386C5D"/></view></view></view>
  <view class="stats"><view class="stat"><text class="muted">今日订单</text><text class="value">{{ summary?.todayOrders ?? 0 }}</text></view><view class="stat"><text class="muted">今日收入</text><text class="value money">¥{{ summary?.todayIncome ?? 0 }}</text></view><view class="stat"><text class="muted">待结算</text><text class="value money">¥{{ summary?.pending ?? 0 }}</text></view><view class="stat"><text class="muted">本月收入</text><text class="value money">¥{{ monthIncome }}</text></view></view>
  <text class="section-title">待办事项</text><view class="todos"><view class="todo" @click="go('pages/order/list')"><text>待接单</text><text class="badge">{{ summary?.awaiting ?? 0 }}</text></view><view class="todo" @click="go('pages/order/list')"><text>待服务</text><text class="badge">{{ summary?.upcoming ?? 0 }}</text></view><view class="todo" @click="go('pages/order/list')"><text>待上传凭证</text><text class="badge">{{ summary?.proofNeeded ?? 0 }}</text></view></view>
  <text class="section-title">常用工具</text><view class="quick"><view @click="go('pages/schedule/index')"><u-icon name="calendar" size="27" color="#386C5D"/><text>排班管理</text></view><view @click="go('pages/project/mine')"><u-icon name="list" size="27" color="#386C5D"/><text>我的项目</text></view><view @click="go('pages/withdraw/index')"><u-icon name="rmb-circle" size="27" color="#386C5D"/><text>提现</text></view></view>
  <text class="section-title">最近订单</text><view v-for="item in recent" :key="item.id" class="panel recent" @click="go('pages/order/detail', { id: item.id })"><view class="row"><text class="order-name">{{ item.project }}</text><text class="tag" :class="{ pending: item.status === '待接单', 'active-status': item.status === '服务中', complete: item.status === '已完成', cancelled: item.status === '已取消' }">{{ item.status }}</text></view><text class="muted">{{ item.date }} {{ item.time }} · {{ item.customer }}</text></view><view v-if="!recent.length" class="empty">暂无订单</view>
</view></template>
<style scoped>
.identity { align-items: flex-start; gap: 12rpx; padding: 24rpx; margin: 4rpx 0 24rpx; background: #FFFFFF; border: 1rpx solid #E8EEEA; border-radius: 44rpx; box-shadow: 0 4rpx 20rpx rgba(65,100,87,.07); }
.person { justify-content: flex-start; flex: 1; min-width: 0; gap: 16rpx; }
.person-copy { display: flex; flex-direction: column; min-width: 0; gap: 8rpx; }
.person-copy .hero-title, .identity-tag { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }
.avatar { width: 88rpx; height: 88rpx; border-radius: 50%; border: 3rpx solid #EAF3EE; flex: none; }
.avatar-fallback { background: #EAF3EE; color: #386C5D; display: flex; align-items: center; justify-content: center; font-size: 36rpx; }
.identity-tag { font-size: 20rpx; color: #386C5D; background: #EAF3EE; border-radius: 999rpx; padding: 3rpx 12rpx; }
.header-actions { display: flex; align-items: flex-start; gap: 6rpx; flex: none; }
.toggle { display: flex; flex-direction: column; align-items: center; flex: none; color: #5F6863; font-size: 21rpx; white-space: nowrap; }
.toggle-label { color: #8A948E; }
.toggle-status.accepting { color: #386C5D; }
.message-link { box-sizing: border-box; width: 64rpx; height: 64rpx; display: flex; align-items: center; justify-content: center; border: 1rpx solid #DDEBE3; border-radius: 50%; background: #EAF3EE; }
.message-link:active, .todo:active, .quick > view:active, .recent:active { opacity: .85; transform: scale(.99); }
.stats { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 16rpx; }
.stat { box-sizing: border-box; min-width: 0; min-height: 158rpx; display: flex; flex-direction: column; justify-content: space-between; gap: 8rpx; padding: 24rpx; background: #FFFFFF; border: 1rpx solid #EEF0EB; border-radius: 44rpx; box-shadow: 0 4rpx 20rpx rgba(65,100,87,.07); }
.value { display: block; max-width: 100%; font-size: 40rpx; line-height: 1.3; font-weight: 700; overflow-wrap: anywhere; word-break: break-word; color: #292F2C; font-variant-numeric: tabular-nums; }
.value.money { color: #386C5D; }
.todos { display: flex; gap: 10rpx; }
.todo { box-sizing: border-box; min-width: 0; flex: 1; min-height: 80rpx; display: flex; justify-content: center; align-items: center; gap: 4rpx; padding: 12rpx 6rpx; border-radius: 999rpx; background: #FAEBDD; color: #79563E; font-size: 21rpx; text-align: center; }
.todo:nth-child(2) { background: #EDF2F5; color: #4F6878; }
.todo:nth-child(3) { background: #EAF3EE; color: #386C5D; }
.badge { flex: none; font-weight: 700; font-size: 24rpx; }
.quick { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 12rpx; }
.quick > view { box-sizing: border-box; min-width: 0; aspect-ratio: 1; background: #FFFFFF; border: 1rpx solid #EEF0EB; border-radius: 44rpx; padding: 16rpx 6rpx; display: flex; flex-direction: column; align-items: center; gap: 14rpx; justify-content: center; font-size: 24rpx; box-shadow: 0 4rpx 20rpx rgba(65,100,87,.07); text-align: center; }
.recent { display: flex; flex-direction: column; gap: 12rpx; }
.order-name { font-weight: 600; color: #292F2C; }
</style>
