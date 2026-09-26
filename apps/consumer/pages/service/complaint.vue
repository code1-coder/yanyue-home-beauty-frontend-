<script setup lang="ts">
import { shallowRef } from 'vue'
import { notice } from '../../shared/navigation'
import DemoNotice from '../../shared/components/DemoNotice.vue'
const category = shallowRef('服务'), description = shallowRef('')
function submit() { if (!description.value.trim()) return notice('请填写投诉描述'); notice('模拟填写完成，未提交至客服') }
</script>
<template><view class="screen"><DemoNotice /><view class="section-title">客服与投诉</view><view class="chips"><text v-for="item in ['服务', '订单', '其他']" :key="item" class="chip" :class="{ selected: category === item }" @click="category = item">{{ item }}</text></view><textarea v-model="description" class="panel textarea section" placeholder="请描述遇到的问题（演示，不上传真实信息）" /><view class="muted">凭证上传和投诉记录待正式接口接入</view><button class="action" @click="submit">模拟提交</button></view></template>
<style scoped>.textarea { box-sizing: border-box; width: 100%; height: 220rpx; }</style>
