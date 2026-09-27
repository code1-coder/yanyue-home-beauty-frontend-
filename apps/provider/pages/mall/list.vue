<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import MallView from '../../features/mall/MallView.vue'
const refreshKey = ref(0)
onShow(() => { refreshKey.value++ })
</script>
<template><MallView mode="list" :refresh-key="refreshKey" /></template>
