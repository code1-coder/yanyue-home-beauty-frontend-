<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { orderRepository } from '../../features/services'
import { go } from '../../shared/navigation'
import DemoNotice from '../../shared/components/DemoNotice.vue'
const id = shallowRef(''), channel = shallowRef<'微信' | '支付宝'>('微信')
onLoad(query => { id.value = query?.id || ''; channel.value = query?.channel === '支付宝' ? '支付宝' : '微信' })
const order = computed(() => orderRepository.byId(id.value))
// PRD 5.1.5: 微信/支付宝均为 P0，但小程序支付宝接入方案待确认；这里只显示渠道意向，不唤起真实收银台。
function simulate(success: boolean) { if (order.value?.status !== '待支付') return; if (success) orderRepository.update(id.value, '待接单'); go('pages/pay/result', { id: id.value, outcome: success ? 'success' : 'failure' }) }
</script>
<template><view class="screen" v-if="order"><DemoNotice /><view class="panel"><view class="section-title">演示订单 · {{ order.status }}</view><view>订单号 {{ order.id }}</view><view class="price">¥{{ order.quote.payable }}</view></view><template v-if="order.status === '待支付'"><view class="section-title">支付方式（演示选择）</view><view class="chips"><text v-for="item in ['微信', '支付宝']" :key="item" class="chip" :class="{ selected: channel === item }" @click="channel = item as typeof channel">{{ item }}</text></view><view class="muted section">倒计时与支付有效期须由正式接口确定；本页不进行任何真实支付。</view><button class="action" @click="simulate(true)">模拟支付成功</button><button class="secondary" @click="simulate(false)">模拟支付失败</button></template><view v-else class="panel muted">该订单当前不在待支付状态，请返回订单详情。</view></view><view v-else class="screen">订单不存在</view></template>
