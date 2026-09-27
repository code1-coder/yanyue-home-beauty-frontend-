<script setup lang="ts">
import { shallowRef } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import ScheduleView from '../../features/schedule/ScheduleView.vue'
const refreshKey = shallowRef(0)
onShow(() => { refreshKey.value++ })
</script>
<template><ScheduleView mode="calendar" :refresh-key="refreshKey" /></template>
