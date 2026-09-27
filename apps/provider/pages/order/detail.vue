<script setup lang="ts">
import { shallowRef } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import OrdersView from '../../features/orders/OrdersView.vue'
const id = shallowRef('')
onLoad(query => { id.value = query?.id || '' })
</script>
<template><OrdersView mode="detail" :id="id" /></template>
