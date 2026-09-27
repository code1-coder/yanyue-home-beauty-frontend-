<script setup lang="ts">
import { shallowRef } from 'vue'
import { profileRepository } from '../../features/services'
const tab = shallowRef('可用')
const coupons = profileRepository.coupons()
</script>
<template><view class="screen"><view class="chips"><text v-for="item in ['可用', '已用', '过期']" :key="item" class="chip" :class="{ selected: tab === item }" @click="tab = item">{{ item }}</text></view><view class="section panel muted">{{ coupons.length ? '优惠券数据待接入' : `暂无${tab}优惠券` }}。优惠分摊与金额由正式接口计算。</view></view></template>
