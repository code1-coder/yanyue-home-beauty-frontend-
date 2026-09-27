<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { profileRepository } from '../features/services'
import DemoNotice from '../shared/components/DemoNotice.vue'

const places: Record<string, Record<string, string[]>> = {
  杭州: { 西湖区: ['文三路', '黄龙商圈', '西溪湿地', '古荡'], 拱墅区: ['武林广场', '运河广场', '城西银泰'], 上城区: ['湖滨银泰', '钱江新城', '南宋御街'], 滨江区: ['星光大道', '滨江宝龙城'] },
  长沙: { 芙蓉区: ['五一广场', '芙蓉广场', '湘江世纪城'], 雨花区: ['德思勤', '高桥', '喜盈门'], 天心区: ['黄兴广场', '南门口', '省政府'], 开福区: ['北辰三角洲', '开福寺', '万达广场'], 岳麓区: ['梅溪湖', '岳麓大学城', '奥克斯广场'] }
}
const city = shallowRef(profileRepository.city() in places ? profileRepository.city() : '杭州')
const district = shallowRef(Object.keys(places[city.value])[0])
const keyword = shallowRef('')
const districts = computed(() => Object.keys(places[city.value]))
const visiblePlaces = computed(() => {
  const query = keyword.value.trim()
  if (!query) return places[city.value][district.value]
  return Object.values(places[city.value]).flat().filter(item => item.includes(query))
})
function chooseCity(value: string) {
  city.value = value
  district.value = Object.keys(places[value])[0]
  keyword.value = ''
}
function choosePlace(label: string) {
  profileRepository.setLocation(city.value, label)
  uni.navigateBack()
}
function chooseDistrict(value: string) {
  district.value = value
  keyword.value = ''
}
</script>

<template>
  <view class="location-screen">
    <view class="location-search"><u-icon name="search" size="20" color="#968e8c" /><input v-model="keyword" placeholder="搜索商圈、地点" placeholder-class="search-placeholder" /><text v-if="keyword" class="clear" @click="keyword = ''">清除</text></view>
    <DemoNotice />
    <view class="location-current"><view><text class="current-label">当前浏览位置</text><text class="current-value">{{ profileRepository.city() }} · {{ profileRepository.locationLabel() || '全城' }}</text></view><u-icon name="map" size="25" color="#c75769" /></view>
    <view class="city-tabs"><text v-for="item in Object.keys(places)" :key="item" class="city-tab" :class="{ active: city === item }" @click="chooseCity(item)">{{ item }}</text></view>
    <view class="location-caption"><text>选择服务地点</text><text class="caption-hint">本地演示地点</text></view>
    <view class="location-columns">
      <scroll-view scroll-y class="districts"><view v-for="item in districts" :key="item" class="district" :class="{ active: district === item && !keyword }" @click="chooseDistrict(item)">{{ item }}</view></scroll-view>
      <scroll-view scroll-y class="places"><view v-for="item in visiblePlaces" :key="item" class="place" @click="choosePlace(item)"><u-icon name="map" size="17" color="#c75769" /><text>{{ item }}</text><u-icon name="arrow-right" size="14" color="#bbb4b1" /></view><view v-if="!visiblePlaces.length" class="no-result">没有匹配的演示地点</view></scroll-view>
    </view>
    <view class="location-footer">浏览位置仅用于展示；预约时需另选实际的上门地址。</view>
  </view>
</template>

<style scoped>
.location-screen { min-height: 100vh; background: #fff; padding: 22rpx 0 calc(65rpx + env(safe-area-inset-bottom)); box-sizing: border-box; }
.location-search { margin: 0 28rpx 18rpx; height: 76rpx; padding: 0 22rpx; display: flex; align-items: center; gap: 14rpx; background: #f6f4f3; border-radius: 8rpx; }
.location-search input { flex: 1; min-width: 0; font-size: 27rpx; }.search-placeholder { color: #a39b98; }.clear { color: #a75a65; font-size: 23rpx; padding: 12rpx; }
.location-screen :deep(.demo) { margin: 0 28rpx 18rpx; }
.location-current { margin: 0 28rpx; padding: 18rpx 0 24rpx; display: flex; align-items: center; justify-content: space-between; border-bottom: 1rpx solid #f0e9e7; }
.location-current > view { display: flex; flex-direction: column; gap: 8rpx; }.current-label { color: #88817e; font-size: 22rpx; }.current-value { font-size: 32rpx; font-weight: 650; }
.city-tabs { display: flex; gap: 36rpx; margin: 0 28rpx; border-bottom: 1rpx solid #f0e9e7; }.city-tab { color: #736d6a; padding: 23rpx 6rpx 20rpx; font-size: 28rpx; }.city-tab.active { color: #c75769; font-weight: 650; border-bottom: 4rpx solid #c75769; }
.location-caption { padding: 30rpx 28rpx 18rpx; display: flex; justify-content: space-between; align-items: center; font-size: 31rpx; font-weight: 650; }.caption-hint { font-weight: 400; color: #aaa19d; font-size: 22rpx; }
.location-columns { display: flex; height: 670rpx; border-top: 1rpx solid #f4efed; border-bottom: 1rpx solid #f4efed; }.districts { width: 210rpx; flex: none; height: 100%; background: #f8f6f5; }.district { padding: 27rpx 12rpx 27rpx 27rpx; font-size: 26rpx; color: #77706d; box-sizing: border-box; }.district.active { background: #fff; border-left: 5rpx solid #c75769; color: #c75769; font-weight: 650; padding-left: 22rpx; }
.places { flex: 1; height: 100%; min-width: 0; padding: 0 25rpx; box-sizing: border-box; }.place { display: flex; align-items: center; gap: 14rpx; min-height: 92rpx; border-bottom: 1rpx solid #f2eeec; font-size: 27rpx; }.place text { flex: 1; }.no-result { color: #8f8784; padding: 42rpx 10rpx; font-size: 25rpx; }
.location-footer { color: #8f8682; font-size: 22rpx; line-height: 1.5; padding: 24rpx 28rpx; }
</style>
