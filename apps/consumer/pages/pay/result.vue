<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { orderRepository } from '../../features/services'
import { go } from '../../shared/navigation'
import DemoNotice from '../../shared/components/DemoNotice.vue'
const id = shallowRef(''), outcome = shallowRef('failure')
onLoad(query => { id.value = query?.id || ''; outcome.value = query?.outcome || 'failure' })
const order = computed(() => orderRepository.byId(id.value))
const successful = computed(() => order.value?.status === '待接单')
</script>
<template><view class="screen" v-if="order"><DemoNotice /><view class="panel"><view class="section-title">{{ successful ? '模拟支付成功' : outcome === 'failure' ? '模拟支付失败' : '模拟支付未完成' }}</view><view class="muted">演示状态：{{ order.status }}</view></view><button class="action" @click="go('pages/order/detail', { id })">查看订单</button></view><view v-else class="screen">订单不存在</view></template>
