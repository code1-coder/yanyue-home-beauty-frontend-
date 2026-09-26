<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { catalogRepository } from '../../features/services'
import { go } from '../../shared/navigation'
import EntityCard from '../../shared/components/EntityCard.vue'
const sort = shallowRef<'距离' | '评分' | '销量'>('距离')
const beauticians = computed(() => catalogRepository.beauticians().sort((a, b) => sort.value === '距离' ? a.distanceKm - b.distanceKm : sort.value === '评分' ? b.rating - a.rating : b.sales - a.sales))
</script>
<template><view class="screen"><view class="chips"><text v-for="item in ['距离', '评分', '销量']" :key="item" class="chip" :class="{ selected: sort === item }" @click="sort = item as typeof sort">{{ item }}</text></view><view class="section"><EntityCard v-for="item in beauticians" :key="item.id" :title="item.name" :detail="item.bio" :meta="`评分 ${item.rating} · 服务 ${item.sales} 单 · ${item.distanceKm} km · 上门费 ¥${item.visitFee}`" @select="go('pages/beautician/detail', { id: item.id })" /></view></view></template>
