<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import ProfileView from '../../features/profile/ProfileView.vue'
const refreshKey = ref(0)
onShow(() => { refreshKey.value++ })
</script>
<template><ProfileView mode="mine" :refresh-key="refreshKey" /></template>
