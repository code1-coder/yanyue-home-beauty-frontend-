<script setup lang="ts">
import { shallowRef } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { orderRepository } from '../../features/services'
import { notice } from '../../shared/navigation'
import DemoNotice from '../../shared/components/DemoNotice.vue'
const id = shallowRef(''), stars = shallowRef(5), text = shallowRef(''), anonymous = shallowRef(false)
onLoad(query => { id.value = query?.id || '' })
function submit() { if (!orderRepository.review(id.value, stars.value, text.value, anonymous.value)) return notice('仅已完成订单可评价'); notice('演示评价已保存'); uni.navigateBack() }
function toggle(event: Event) { anonymous.value = (event as unknown as { detail: { value: boolean } }).detail.value }
</script>
<template><view class="screen"><DemoNotice /><view class="section-title">服务评价</view><view class="chips"><text v-for="item in [1, 2, 3, 4, 5]" :key="item" class="chip" :class="{ selected: stars === item }" @click="stars = item">{{ item }} 星</text></view><textarea v-model="text" class="panel textarea section" placeholder="写下服务体验" /><view class="row panel"><text>匿名评价</text><switch :checked="anonymous" color="#187f70" @change="toggle" /></view><view class="muted">图片上传待正式媒资接口接入</view><button class="action" @click="submit">提交评价</button></view></template>
<style scoped>.textarea { box-sizing: border-box; width: 100%; height: 220rpx; }</style>
