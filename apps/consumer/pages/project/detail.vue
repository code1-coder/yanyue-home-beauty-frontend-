<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { catalogRepository } from '../../features/services'
import { go } from '../../shared/navigation'
import EntityCard from '../../shared/components/EntityCard.vue'
const id = shallowRef('')
onLoad(query => { id.value = query?.id || '' })
const project = computed(() => catalogRepository.project(id.value))
const beauticians = computed(() => catalogRepository.beauticians().filter(item => item.projectIds.includes(id.value)))
</script>
<template><view class="screen" v-if="project"><view class="panel"><view class="row"><text class="section-title">{{ project.name }}</text><text class="price">¥{{ project.price }}</text></view><text class="muted">{{ project.durationMinutes }} 分钟 · {{ project.category }}</text></view><view class="section"><view class="section-title">服务说明</view><view class="panel">{{ project.description }}</view><view class="section-title">适用人群与禁忌</view><view class="panel">{{ project.audience }}<view class="muted">{{ project.cautions }}</view></view></view><view class="section"><view class="section-title">可选美容师</view><EntityCard v-for="item in beauticians" :key="item.id" :title="item.name" :detail="item.bio" :meta="`评分 ${item.rating} · 上门费 ¥${item.visitFee}`" @select="go('pages/beautician/detail', { id: item.id, projectId: project.id })" /></view><button class="action" @click="go('pages/order/booking', { projectId: project.id, beauticianId: beauticians[0]?.id || '' })">立即预约</button></view><view v-else class="screen">项目不存在</view></template>
