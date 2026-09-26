<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { catalogRepository, orderRepository } from '../../features/services'
import { go } from '../../shared/navigation'
import type { ServiceOrder } from '../../features/services'
import EntityCard from '../../shared/components/EntityCard.vue'
const filter = shallowRef('全部'), orders = shallowRef<ServiceOrder[]>([])
onShow(() => { orders.value = orderRepository.all() })
const tabs = ['全部', '待支付', '待接单', '待服务', '服务中', '已完成', '退款']
const visible = computed(() => orders.value.filter(item => filter.value === '全部' || (filter.value === '退款' ? item.status.includes('退款') : item.status === filter.value)))
</script>
<template><view class="screen"><scroll-view scroll-x><view class="chips nowrap"><text v-for="item in tabs" :key="item" class="chip" :class="{ selected: filter === item }" @click="filter = item">{{ item }}</text></view></scroll-view><view class="section"><EntityCard v-for="item in visible" :key="item.id" :title="catalogRepository.project(item.draft.projectId)?.name || '项目'" :detail="`${item.draft.date} ${item.draft.slot} · ${item.status}`" :meta="item.id" :price="item.quote.payable" @select="go('pages/order/detail', { id: item.id })" /><view v-if="!visible.length" class="panel muted">暂无{{ filter === '全部' ? '' : filter }}订单</view></view></view></template>
<style scoped>.nowrap { flex-wrap: nowrap; width: max-content; }</style>
