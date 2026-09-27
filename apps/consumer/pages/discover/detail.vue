<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { profileRepository } from '../../features/services'
import { showDemoLimit } from '../../shared/navigation'
const id = shallowRef('')
onLoad(query => { id.value = query?.id || '' })
const entry = computed(() => profileRepository.discover().find(item => item.id === id.value))
</script>
<template><view class="screen" v-if="entry"><view class="section-title">{{ entry.title }}</view><view class="panel">{{ entry.body }}</view><view class="chips"><text class="chip" @click="showDemoLimit">点赞 {{ entry.likes }}</text><text class="chip" @click="showDemoLimit">收藏 {{ entry.favorites }}</text><text class="chip" @click="showDemoLimit">评论 {{ entry.comments }}</text><text class="chip" @click="showDemoLimit">分享</text></view><view class="muted section">图文/视频上传和内容互动待正式接口接入</view></view><view v-else class="screen">内容不存在</view></template>
