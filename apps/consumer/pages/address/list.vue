<script setup lang="ts">
import { shallowRef } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { bookingRepository, profileRepository } from '../../features/services'
import { go, notice } from '../../shared/navigation'
import type { Address } from '../../features/services'
const selecting = shallowRef(false)
const addresses = shallowRef<Address[]>([])
onLoad(query => { selecting.value = query?.select === '1' })
onShow(() => { addresses.value = profileRepository.addresses() })
function choose(id: string) { if (!selecting.value) return; const draft = bookingRepository.draft(); if (draft) bookingRepository.setDraft({ ...draft, addressId: id }); uni.navigateBack() }
function remove(id: string) { profileRepository.deleteAddress(id); addresses.value = profileRepository.addresses(); notice('已删除演示地址') }
function setDefault(address: Address) { profileRepository.upsertAddress({ ...address, isDefault: true }); addresses.value = profileRepository.addresses() }
</script>
<template><view class="screen"><view v-for="item in addresses" :key="item.id" class="panel"><view class="row" @click="choose(item.id)"><view><view>{{ item.name }} · {{ item.phone }}</view><view class="muted">{{ item.city }} {{ item.detail }}</view></view><text v-if="item.isDefault">默认</text></view><view class="row controls"><text @click="setDefault(item)">设为默认</text><text @click="go('pages/address/edit', { id: item.id })">编辑</text><text @click="remove(item.id)">删除</text></view></view><view v-if="!addresses.length" class="panel muted">暂无地址</view><button class="action" @click="go('pages/address/edit')">新增地址</button></view></template>
<style scoped>.controls { margin-top: 24rpx; padding-top: 18rpx; border-top: 1rpx solid #edf0ef; color: #187f70; }</style>
