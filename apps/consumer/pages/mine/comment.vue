<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { orderRepository, catalogRepository } from '../../features/services'
import { go, showDemoLimit } from '../../shared/navigation'
import type { ServiceOrder } from '../../features/services'
const orders = shallowRef<ServiceOrder[]>([])
onShow(() => { orders.value = orderRepository.all() })
const reviewed = computed(() => orders.value.filter(item => !!item.review))
</script>
<template><view class="screen"><view v-for="item in reviewed" :key="item.id" class="panel" @click="go('pages/order/detail', { id: item.id })"><view class="section-title">{{ catalogRepository.project(item.draft.projectId)?.name }}</view><view>{{ item.review?.stars }} 星 · {{ item.review?.text || '未填写文字' }}</view><view class="muted" @click.stop="showDemoLimit">追评待接入</view></view><view v-if="!reviewed.length" class="panel muted">暂无评价</view></view></template>
