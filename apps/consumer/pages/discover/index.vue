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
    <view class="topic-strip"><view v-for="item in ['精选', ...topics]" :key="item" class="topic" :class="{ active: activeTopic === item }" hover-class="pressed" @click="activeTopic = item"><text>{{ item }}</text></view></view>
    <view v-for="{ entry, index } in visibleEntries" :key="entry.id" class="story" hover-class="pressed"><u-card :show-head="false" :show-foot="false" :border="false" margin="0" padding="0" border-radius="16rpx" box-shadow="0 2rpx 12rpx rgba(0,0,0,0.04)" @click="go('pages/discover/detail', { id: entry.id })"><template #body><image class="story-image" :src="images[index % images.length]" mode="aspectFill" /><view class="story-copy"><text class="story-label">{{ topics[index % topics.length] }}</text><text class="story-title">{{ entry.title }}</text><text class="story-body">{{ entry.body }}</text><view class="story-meta"><view class="meta-group"><view class="meta-item"><u-icon name="thumb-up" size="14" color="#999999" /><text>赞 {{ entry.likes }}</text></view><view class="meta-item"><u-icon name="heart" size="14" color="#999999" /><text>收藏 {{ entry.favorites }}</text></view></view><view class="meta-item"><u-icon name="chat" size="14" color="#999999" /><text>评论 {{ entry.comments }} ›</text></view></view></view></template></u-card></view>
  </view>
</template>
<style scoped>
.discover-screen { padding: 12rpx 24rpx 145rpx; color: #333; }
.discover-heading { display: flex; flex-direction: column; gap: 5rpx; margin: 10rpx 0 22rpx; }
.discover-heading .section-title { margin: 0; font-size: 36rpx; }
.topic-strip { display: flex; align-items: center; justify-content: space-between; gap: 16rpx; overflow-x: auto; white-space: nowrap; margin: 0 0 26rpx; }
.topic { flex: none; position: relative; font-size: 25rpx; color: #999; padding: 12rpx 0 20rpx; }
.topic.active { font-weight: 700; color: #a77575; }
.topic.active::after { content: ''; position: absolute; left: 50%; bottom: 3rpx; transform: translateX(-50%); width: 30rpx; height: 5rpx; background: #d9a4a4; border-radius: 6rpx; }
.story { border-radius: 16rpx; overflow: hidden; margin-bottom: 28rpx; }
.story-image { width: 100%; height: 292rpx; display: block; border-radius: 16rpx; }
.story-copy { display: flex; flex-direction: column; gap: 10rpx; padding: 24rpx; }
.story-label { color: #a77575; font-size: 19rpx; }
.story-title { font-weight: 650; font-size: 30rpx; line-height: 1.4; }
.story-body { color: #666; font-size: 23rpx; line-height: 1.5; }
.story-meta { display: flex; justify-content: space-between; align-items: center; gap: 12rpx; font-size: 19rpx; color: #999; border-top: 1rpx solid #f3eeec; padding-top: 18rpx; margin-top: 10rpx; }
.meta-group, .meta-item { display: flex; align-items: center; gap: 7rpx; }
.meta-group { gap: 23rpx; }
.pressed { background-color: #f1eeee !important; opacity: .84; }
</style>
