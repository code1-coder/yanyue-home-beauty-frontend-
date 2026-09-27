<script setup lang="ts">
import { shallowRef } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import MallView from '../../features/mall/MallView.vue'
const id = shallowRef(''), spec = shallowRef('')
onLoad(query => { id.value = query?.id || ''; spec.value = query?.spec || '' })
</script>
<template><MallView mode="confirm" :id="id" :spec="spec" /></template>
