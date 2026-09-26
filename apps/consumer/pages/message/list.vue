<script setup lang="ts">
import { profileRepository } from '../../features/services'
const messages = profileRepository.messages()
</script>
<template><view class="screen"><view v-for="item in messages" :key="item.id" class="panel"><view class="row"><text class="section-title">{{ item.title }}</text><text class="muted">{{ item.type }}</text></view><view>{{ item.body }}</view></view><view class="muted">订单、支付、服务、系统消息的真实推送与已读状态待接入。</view></view></template>
