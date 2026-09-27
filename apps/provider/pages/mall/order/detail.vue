<script setup lang="ts">
import { shallowRef } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import MallView from '../../../features/mall/MallView.vue'
const id = shallowRef('')
onLoad(query => { id.value = query?.id || '' })
</script>
<template><MallView mode="order" :id="id" /></template>
