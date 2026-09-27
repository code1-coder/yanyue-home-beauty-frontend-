<script setup lang="ts">
import { shallowRef } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { orderRepository } from '../../features/services'
import { notice } from '../../shared/navigation'
import DemoNotice from '../../shared/components/DemoNotice.vue'
const id = shallowRef(''), reason = shallowRef('')
onLoad(query => { id.value = query?.id || '' })
function submit() { if (!orderRepository.requestRefund(id.value, reason.value)) return notice('请填写退款原因'); notice('已提交模拟售后'); uni.navigateBack() }
</script>
<template><view class="screen"><DemoNotice /><view class="panel"><view class="section-title">申请退款/售后</view><view class="muted">退款金额、凭证上传、处理状态与抽成冲正需由服务端确定。本地仅记录申请原因。</view><textarea v-model="reason" class="field textarea" placeholder="请填写退款原因" /></view><button class="action" @click="submit">提交演示申请</button></view></template>
<style scoped>.textarea { width: 100%; height: 190rpx; }</style>
