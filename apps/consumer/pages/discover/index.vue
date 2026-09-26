<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { profileRepository } from '../../features/services'
import { go } from '../../shared/navigation'
import DemoNotice from '../../shared/components/DemoNotice.vue'
const entries = profileRepository.discover()
const images = ['/static/beauty-spa.jpg', '/static/beauty-facial-new.jpg', '/static/beauty-spa.jpg']
const topics = ['居家护理', '预约指南', '身体舒缓']
const activeTopic = shallowRef('精选')
const visibleEntries = computed(() => entries.map((entry, index) => ({ entry, index })).filter(({ index }) => activeTopic.value === '精选' || topics[index] === activeTopic.value))
</script>
<template>
  <view class="screen discover-screen"><DemoNotice /><view class="discover-heading"><text class="section-title">发现</text><text class="muted">适合你的居家护理灵感</text></view>
    <view class="topic-strip"><text v-for="item in ['精选', ...topics]" :key="item" class="topic" :class="{ active: activeTopic === item }" @click="activeTopic = item">{{ item }}</text></view>
    <view v-for="{ entry, index } in visibleEntries" :key="entry.id" class="story" @click="go('pages/discover/detail', { id: entry.id })"><image :src="images[index % images.length]" mode="aspectFill" /><view class="story-copy"><text class="story-label">{{ topics[index % topics.length] }}</text><text class="story-title">{{ entry.title }}</text><text class="story-body">{{ entry.body }}</text><view class="story-meta"><text>赞 {{ entry.likes }} · 收藏 {{ entry.favorites }}</text><text>评论 {{ entry.comments }} ›</text></view></view></view>
  </view>
</template>
<style scoped>
.discover-screen { padding: 12rpx 24rpx 145rpx; }.discover-heading { display: flex; flex-direction: column; gap: 5rpx; margin: 10rpx 0 22rpx; }.discover-heading .section-title { margin: 0; font-size: 36rpx; }.topic-strip { display: flex; align-items: center; gap: 30rpx; overflow-x: auto; white-space: nowrap; margin: 0 0 22rpx; }.topic { flex: none; font-size: 25rpx; color: #88807c; padding: 10rpx 0; }.topic.active { font-weight: 650; color: #bd5264; border-bottom: 4rpx solid #bd5264; }.story { background: #fff; border-radius: 8rpx; overflow: hidden; margin-bottom: 22rpx; }.story image { width: 100%; height: 292rpx; display: block; }.story-copy { display: flex; flex-direction: column; gap: 9rpx; padding: 22rpx; }.story-label { color: #a45d69; font-size: 21rpx; }.story-title { font-weight: 650; font-size: 30rpx; line-height: 1.35; }.story-body { color: #807a76; font-size: 23rpx; line-height: 1.4; }.story-meta { display: flex; justify-content: space-between; font-size: 21rpx; color: #788e7f; border-top: 1rpx solid #f3eeec; padding-top: 15rpx; margin-top: 8rpx; }
</style>
