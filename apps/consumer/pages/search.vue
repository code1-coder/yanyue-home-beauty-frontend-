<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { catalogRepository } from '../features/services'
import { go } from '../shared/navigation'
import EntityCard from '../shared/components/EntityCard.vue'
const keyword = shallowRef(''), category = shallowRef<'项目' | '美容师'>('项目')
const projects = computed(() => catalogRepository.projects().filter(item => `${item.name}${item.category}`.includes(keyword.value.trim())))
const beauticians = computed(() => catalogRepository.beauticians().filter(item => `${item.name}${item.bio}`.includes(keyword.value.trim())))
</script>
<template><view class="screen"><input v-model="keyword" class="panel input" placeholder="搜索美容项目、美容师" /><view class="chips"><text v-for="item in ['项目', '美容师']" :key="item" class="chip" :class="{ selected: category === item }" @click="category = item as typeof category">{{ item }}</text></view><view class="section"><template v-if="category === '项目'"><EntityCard v-for="item in projects" :key="item.id" :title="item.name" :detail="item.description" :price="item.price" @select="go('pages/project/detail', { id: item.id })" /></template><template v-else><EntityCard v-for="item in beauticians" :key="item.id" :title="item.name" :detail="item.bio" @select="go('pages/beautician/detail', { id: item.id })" /></template></view></view></template>
<style scoped>.input { box-sizing: border-box; width: 100%; height: 90rpx; }</style>
