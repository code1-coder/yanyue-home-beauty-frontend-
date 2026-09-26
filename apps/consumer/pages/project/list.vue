<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { catalogRepository } from '../../features/services'
import { go } from '../../shared/navigation'
import EntityCard from '../../shared/components/EntityCard.vue'
import DemoNotice from '../../shared/components/DemoNotice.vue'
const category = shallowRef('全部')
const sort = shallowRef('推荐')
onLoad((query) => { if (query?.category) category.value = decodeURIComponent(query.category) })
const categories = ['全部', ...catalogRepository.categories()]
const projects = computed(() => {
  const filtered = catalogRepository.projects().filter(item => category.value === '全部' || item.category === category.value)
  return sort.value === '价格' ? filtered.sort((a, b) => a.price - b.price) : filtered
})
</script>
<template>
  <view class="screen catalog-screen">
    <DemoNotice />
    <scroll-view scroll-x class="category-scroll"><view class="category-list"><text v-for="item in categories" :key="item" class="category" :class="{ selected: category === item }" @click="category = item">{{ item }}</text></view></scroll-view>
    <view class="list-heading"><text class="section-title">{{ category === '全部' ? '全部项目' : category }}</text><text class="sort" @click="sort = sort === '推荐' ? '价格' : '推荐'">{{ sort === '推荐' ? '推荐排序' : '价格优先' }} ⌄</text></view>
    <view class="catalog-list"><view v-for="item in projects" :key="item.id" class="catalog-item" @click="go('pages/project/detail', { id: item.id })"><image class="catalog-image" :src="`/static/${item.id === 'p2' ? 'beauty-nails.jpg' : item.id === 'p3' ? 'beauty-spa.jpg' : 'beauty-facial-new.jpg'}`" mode="aspectFill" /><view class="catalog-copy"><text class="catalog-name">{{ item.name }}</text><text class="muted">{{ item.description }}</text><text class="catalog-meta">{{ item.durationMinutes }}分钟 · 上门服务</text><view class="catalog-bottom"><text class="price">¥{{ item.price }}</text><text class="catalog-action">查看详情 ›</text></view></view></view></view>
  </view>
</template>
<style scoped>
.catalog-screen { padding-top: 16rpx; }.category-scroll { white-space: nowrap; margin: 4rpx -28rpx 0; }.category-list { display: flex; gap: 12rpx; width: max-content; padding: 12rpx 28rpx; }.category { background: #fff; color: #625d5a; border: 1rpx solid #eee1df; padding: 13rpx 20rpx; border-radius: 6rpx; font-size: 24rpx; }.category.selected { background: #cf5c6e; border-color: #cf5c6e; color: #fff; }.list-heading { display: flex; align-items: center; justify-content: space-between; margin: 28rpx 0 8rpx; }.list-heading .section-title { margin-bottom: 0; }.sort { color: #8a807d; font-size: 24rpx; padding: 12rpx 0; }.catalog-list { background: #fff; padding: 0 18rpx; border-radius: 8rpx; }.catalog-item { display: flex; gap: 20rpx; padding: 22rpx 0; border-bottom: 1rpx solid #f0e9e7; }.catalog-item:last-child { border: 0; }.catalog-image { width: 170rpx; height: 170rpx; flex: none; border-radius: 6rpx; }.catalog-copy { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 9rpx; }.catalog-name { font-size: 29rpx; font-weight: 650; }.catalog-copy .muted { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.catalog-meta { color: #6d8b7c; font-size: 22rpx; }.catalog-bottom { margin-top: auto; display: flex; align-items: end; justify-content: space-between; }.catalog-action { font-size: 22rpx; color: #ad6771; }
</style>
