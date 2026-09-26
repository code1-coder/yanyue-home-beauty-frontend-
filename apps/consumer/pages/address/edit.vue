<script setup lang="ts">
import { reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { profileRepository } from '../../features/services'
import { notice } from '../../shared/navigation'
import type { Address } from '../../features/services'
const form = reactive<Address>({ id: '', name: '', phone: '', city: '', detail: '', isDefault: false })
onLoad(query => { const address = query?.id ? profileRepository.address(query.id) : null; if (address) Object.assign(form, address) })
function save() { if (!form.name.trim() || !/^1\d{10}$/.test(form.phone) || !form.city.trim() || !form.detail.trim()) return notice('请填写联系人、手机号和完整地址'); profileRepository.upsertAddress({ ...form, id: form.id || `a${Date.now()}` }); uni.navigateBack() }
function toggle(event: Event) { form.isDefault = (event as unknown as { detail: { value: boolean } }).detail.value }
</script>
<template><view class="screen"><view class="panel"><input v-model="form.name" class="field" placeholder="联系人" /><input v-model="form.phone" class="field" type="number" maxlength="11" placeholder="手机号（演示数据请勿填真实号码）" /><input v-model="form.city" class="field" placeholder="城市" /><input v-model="form.detail" class="field" placeholder="详细地址" /><view class="row field"><text>设为默认</text><switch :checked="form.isDefault" color="#187f70" @change="toggle" /></view></view><button class="action" @click="save">保存地址</button></view></template>
