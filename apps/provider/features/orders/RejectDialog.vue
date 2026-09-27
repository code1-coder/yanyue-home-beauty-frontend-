<script setup lang="ts">
import { shallowRef } from 'vue'
defineProps<{ visible: boolean }>()
const emit = defineEmits<{ close: []; confirm: [reason: string] }>()
const reason = shallowRef(''), custom = shallowRef('')
const reasons = ['时间冲突', '路程较远', '身体不适', '其他原因']
</script>
<template><view v-if="visible" class="mask"><view class="dialog"><text class="section-title">拒绝订单</text><view class="chips"><view v-for="item in reasons" :key="item" class="chip" :class="{ active: reason === item }" @click="reason = item">{{ item }}</view></view><textarea v-if="reason === '其他原因'" v-model="custom" class="reason" placeholder="请输入具体原因"/><view class="row"><button class="secondary half" @click="emit('close')">取消</button><button class="action half" @click="emit('confirm', reason === '其他原因' ? custom.trim() : reason)">确认拒单</button></view></view></view></template>
<style scoped>.mask { position: fixed; inset: 0; z-index: 20; background: #1D292680; display: flex; align-items: center; justify-content: center; }.dialog { width: 85%; box-sizing: border-box; padding: 32rpx; border-radius: 24rpx; background: white; }.half { width: 48%; }.reason { width: 100%; border: 1rpx solid #E2E9E6; padding: 20rpx; box-sizing: border-box; height: 120rpx; border-radius: 24rpx; }</style>
