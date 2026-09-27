<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import WorkbenchView from '../../features/workbench/WorkbenchView.vue'
const refreshKey = ref(0)
onShow(() => { refreshKey.value++ })
</script>
<template><WorkbenchView :refresh-key="refreshKey" /></template>
