<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import OrdersView from '../../features/orders/OrdersView.vue'
const refreshKey = ref(0)
onShow(() => { refreshKey.value++ })
</script>
<template><OrdersView mode="list" :refresh-key="refreshKey" /></template>
