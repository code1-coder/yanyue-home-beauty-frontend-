<script setup lang="ts">
import { computed, onMounted, reactive, shallowRef, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { services } from '../services'
import type { MallOrder, Product } from '../types'
import { go, run, toast } from '../../shared/navigation'
import DemoBanner from '../../shared/components/DemoBanner.vue'
const props = defineProps<{ mode: 'list' | 'detail' | 'confirm' | 'orders' | 'order'; id?: string; spec?: string; refreshKey?: number }>()
const products = shallowRef<Product[]>([]), product = shallowRef<Product>(), orders = shallowRef<MallOrder[]>([]), current = shallowRef<MallOrder>(), category = shallowRef('全部'), status = shallowRef('全部'), spec = shallowRef(''), quantity = shallowRef(1), reason = shallowRef('')
const tracking = shallowRef('')
const checkout = reactive({ address: '杭州市西湖区演示工作室', payChannel: '微信' as '微信'|'支付宝' })
const categories = ['全部', '工具', '耗材'], states = ['全部', '待支付', '待发货', '待收货', '已完成', '售后中']
const visible = computed(() => status.value === '全部' ? orders.value : orders.value.filter(o => o.status === status.value))
const total = computed(() => (product.value?.price || 0) * quantity.value)
async function refresh() { products.value = await services.mall.products(); orders.value = await services.mall.orders(); if (props.id) { product.value = await services.mall.product(props.id); current.value = await services.mall.order(props.id); tracking.value = current.value ? await services.mall.tracking(props.id) : ''; if (product.value && !spec.value) spec.value = props.spec || product.value.specs[0] } }
onShow(refresh)
onMounted(refresh)
watch(() => props.id, refresh)
watch(() => props.refreshKey, refresh)
function chooseCategory(value: string) { category.value = value }
async function create() { if (!product.value) return; try { const o = await services.mall.create({ productId: product.value.id, spec: spec.value, quantity: Number(quantity.value), address: checkout.address, payChannel: checkout.payChannel }); go('pages/mall/order/detail', { id: o.id }) } catch (e) { toast(e instanceof Error ? e.message : '下单失败') } }
async function pay() { if (current.value && await run(() => services.mall.pay(current.value!.id), '模拟支付已提交')) refresh() }
async function afterSale() { if (current.value && await run(() => services.mall.afterSale(current.value!.id, reason.value), '售后申请已提交')) refresh() }
function name(id: string) { return products.value.find(p => p.id === id)?.name || '工具商品' }
const visibleProducts = computed(() => category.value === '全部' ? products.value : products.value.filter(p => p.category === category.value))
</script>
<template><view class="screen" :class="{ 'tab-screen': mode === 'list' }"><DemoBanner />
  <template v-if="mode === 'list'"><view class="row mall-heading"><text class="hero-title">工具商城</text><text class="link" @click="go('pages/mall/order/list')">我的订单 ›</text></view><view class="chips"><view v-for="c in categories" :key="c" class="chip" :class="{ active: category === c }" @click="chooseCategory(c)">{{ c }}</view></view><view v-for="item in visibleProducts" :key="item.id" class="panel product" @click="go('pages/mall/detail', { id: item.id })"><view class="thumb"><u-icon :name="item.category === '工具' ? 'grid' : 'bag'" size="36" color="#386C5D"/></view><view class="product-copy"><text class="product-name">{{ item.name }}</text><view class="product-meta"><text class="tag">{{ item.category }}</text><text class="muted">库存 {{ item.stock }}</text></view><text class="money product-price">¥{{ item.price }}</text></view></view></template>
  <template v-else-if="mode === 'orders'"><view class="chips"><view v-for="s in states" :key="s" class="chip" :class="{ active: status === s }" @click="status = s">{{ s }}</view></view><view v-for="item in visible" :key="item.id" class="panel stack" @click="go('pages/mall/order/detail', { id: item.id })"><view class="row"><text>{{ name(item.productId) }}</text><text class="tag">{{ item.status }}</text></view><text class="muted">{{ item.id }} · {{ item.spec }} × {{ item.quantity }}</text><text class="money">¥{{ item.amount }}</text></view><view v-if="!visible.length" class="empty">暂无商城订单</view></template>
  <template v-else-if="mode === 'order' && current"><view class="hero"><text class="hero-title">{{ current.status }}</text><text class="hero-sub">商城订单 {{ current.id }}</text></view><view class="panel stack"><text>{{ name(current.productId) }}</text><text>{{ current.spec }} × {{ current.quantity }}</text><text class="money">¥{{ current.amount }}</text><text class="muted">配送至 {{ current.address }}</text><text class="muted">{{ tracking || '待生成物流信息' }}</text><text v-if="current.afterSaleReason">售后原因：{{ current.afterSaleReason }}</text></view><button v-if="current.status === '待支付'" class="action" @click="pay">模拟支付 · {{ current.payChannel }}</button><template v-if="current.status === '待收货' || current.status === '已完成'"><label class="field">售后原因<textarea v-model="reason" placeholder="描述商品问题"/></label><button class="secondary" @click="afterSale">申请售后</button></template><text class="muted">支付结果和物流状态需正式接口核验。</text></template>
  <template v-else-if="product"><view class="cover"><u-icon :name="product.category === '工具' ? 'grid' : 'bag'" size="64" color="#2A594F"/></view><view class="panel stack"><text class="section-title">{{ product.name }}</text><text class="muted">{{ product.description }}</text><view class="row"><text class="money">¥{{ product.price }}</text><text class="muted">库存 {{ product.stock }}</text></view></view><text class="section-title">规格</text><view class="chips"><view v-for="option in product.specs" :key="option" class="chip" :class="{ active: spec === option }" @click="spec = option">{{ option }}</view></view><template v-if="mode === 'confirm'"><view class="panel"><label class="field">购买数量<input v-model.number="quantity" type="number"/></label><label class="field">配送地址<input v-model="checkout.address"/></label><text>支付渠道</text><view class="chips"><view v-for="channel in ['微信','支付宝']" :key="channel" class="chip" :class="{ active: checkout.payChannel === channel }" @click="checkout.payChannel = channel as '微信'|'支付宝'">{{ channel }}</view></view><view class="row"><text>订单金额</text><text class="money">¥{{ total }}</text></view></view><button class="action" @click="create">创建商城订单</button></template><button v-else class="action" @click="go('pages/mall/confirm', { id: product!.id, spec })">立即购买</button></template><view v-else class="empty">商品或订单不存在</view>
</view></template>
<style scoped>
.mall-heading { margin: 8rpx 0 24rpx; }
.mall-heading .link { flex: none; }
.product { display: flex; gap: 24rpx; align-items: center; }
.product:active { opacity: .86; transform: scale(.99); }
.thumb { width: 148rpx; height: 148rpx; flex: none; border-radius: 32rpx; background: #F6EBE5; display: flex; align-items: center; justify-content: center; }
.product:nth-of-type(even) .thumb { background: #EAF3EE; }
.product-copy { min-width: 0; flex: 1; display: flex; flex-direction: column; align-items: flex-start; gap: 10rpx; }
.product-name { font-weight: 650; color: #292F2C; overflow-wrap: anywhere; }
.product-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 10rpx; }
.product-price { font-size: 34rpx; line-height: 1.2; color: #386C5D; }
.cover { width: 100%; height: 330rpx; border-radius: 24rpx; margin-bottom: 24rpx; background: #E6F2EF; display: flex; align-items: center; justify-content: center; }
</style>
