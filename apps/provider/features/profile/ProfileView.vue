<script setup lang="ts">
import { onMounted, reactive, ref, shallowRef, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { services } from '../services'
import type { Project, Provider, Qualification } from '../types'
import { go, inputValue, run, switchValue, toast } from '../../shared/navigation'
import { clearSelectedImages, selectImage } from '../../platform/media'
import DemoBanner from '../../shared/components/DemoBanner.vue'
import LinkRow from '../../shared/components/LinkRow.vue'
const props = defineProps<{ mode: 'mine' | 'profile' | 'qualification' | 'service' | 'projects' | 'setting'; refreshKey?: number }>()
const profile = reactive<Provider>({} as Provider), qualifications = ref<Qualification[]>([]), projects = ref<Project[]>([]), balance = shallowRef(0)
async function refresh() { Object.assign(profile, await services.profile.get()); qualifications.value = (await services.onboarding.get()).qualifications; projects.value = await services.projects.list(); balance.value = (await services.finance.wallet()).available }
onShow(refresh)
onMounted(refresh)
watch(() => props.refreshKey, refresh)
async function photo(field: 'avatar') { try { profile[field] = await selectImage() } catch { toast('未选择图片') } }
async function credential(item: Qualification) { try { const file = await selectImage(); if (await run(() => services.onboarding.updateQualification({ ...item, file }), '更新已提交审核')) qualifications.value = (await services.onboarding.get()).qualifications } catch { toast('未选择图片') } }
async function logout() { if (await run(() => services.auth.logout(), '已退出演示登录')) go('pages/login') }
async function reset() { services.resetDemo(); clearSelectedImages(); toast('演示数据已重置'); go('pages/workbench/index') }
</script>
<template><view class="screen" :class="{ 'tab-screen': mode === 'mine' }"><DemoBanner />
  <template v-if="mode === 'mine'"><view class="mine-identity" @click="go('pages/mine/profile')"><view class="mine-person row"><image v-if="profile.avatar" :src="profile.avatar" class="mine-avatar" mode="aspectFill"/><view v-else class="mine-avatar avatar-fallback">{{ profile.nickname?.slice(0, 1) || '颜' }}</view><view class="mine-copy"><text class="hero-title">{{ profile.nickname || '服务者' }}</text><text class="tag">资质{{ profile.reviewStatus }}</text></view><u-icon name="arrow-right" size="16" color="#829C93"/></view><view class="mine-balance"><text>可提现余额</text><text class="mine-amount">¥{{ balance }}</text></view></view><text class="section-title mine-section">资金管理</text><view class="panel menu"><LinkRow icon="rmb-circle" label="收益中心" path="pages/income/index"/><LinkRow icon="wallet" label="提现" path="pages/withdraw/index"/></view><text class="section-title mine-section">个人与服务管理</text><view class="panel menu"><LinkRow icon="list" label="服务项目" path="pages/project/mine"/><LinkRow icon="calendar" label="排班管理" path="pages/schedule/index"/><LinkRow icon="account" label="个人资料" path="pages/mine/profile"/><LinkRow icon="checkmark-circle" label="资质管理" path="pages/mine/qualification"/><LinkRow icon="setting" label="服务设置" path="pages/mine/service"/><LinkRow icon="star" label="评价管理" path="pages/comment/list"/><LinkRow icon="bell" label="消息中心" path="pages/message/list"/><LinkRow icon="bag" label="商城订单" path="pages/mall/order/list"/><LinkRow icon="setting" label="设置" path="pages/mine/setting"/></view></template>
  <template v-else-if="mode === 'profile'"><view class="panel"><view class="row"><text>头像</text><button size="mini" @click="photo('avatar')">{{ profile.avatar ? '已选择 · 更换' : '选择图片' }}</button></view><label class="field">昵称<input v-model="profile.nickname"/></label><label class="field">简介<textarea v-model="profile.bio"/></label><label class="field">擅长项目（逗号分隔）<input :value="profile.specialties?.join('，')" @input="profile.specialties = inputValue($event).split(/[,，]/).map((s: string) => s.trim()).filter(Boolean)"/></label></view><button class="action" @click="run(() => services.profile.update({ avatar: profile.avatar, nickname: profile.nickname, bio: profile.bio, specialties: profile.specialties }))">保存资料</button></template>
  <template v-else-if="mode === 'qualification'"><view class="hero"><text class="hero-title">资质状态 · {{ profile.reviewStatus }}</text><text class="hero-sub">审核与证件有效性由平台确认</text></view><view v-for="item in qualifications" :key="item.id" class="panel stack"><view class="row"><text>{{ item.name }}</text><text class="tag">{{ item.status }}</text></view><view class="field">有效期<picker mode="date" :value="item.expires" @change="item.expires = inputValue($event)"><view class="chip">{{ item.expires || '选择有效期' }}</view></picker></view><view class="row"><text v-if="item.expires < new Date().toISOString().slice(0,10)" class="danger">已过期 · 演示接单不可开启</text><button size="mini" @click="credential(item)">更新证件</button></view></view><button class="secondary" @click="go('pages/join/status')">查看审核进度</button></template>
  <template v-else-if="mode === 'service'"><view class="panel"><label class="field">服务半径（km）<input v-model.number="profile.radiusKm" type="number"/></label><text class="muted">超出服务半径仍可下单，服务者可拒单。</text><text class="section-title">上门费规则</text><view class="chips"><view v-for="mode in ['固定','阶梯','满免']" :key="mode" class="chip" :class="{ active: profile.visitFee?.mode === mode }" @click="profile.visitFee.mode = mode as '固定'|'阶梯'|'满免'">{{ mode }}</view></view><label class="field">基础上门费（元）<input v-model.number="profile.visitFee.fixed" type="number"/></label><label v-if="profile.visitFee?.mode === '阶梯'" class="field">每公里增加（元）<input v-model.number="profile.visitFee.perKm" type="number"/></label><label v-if="profile.visitFee?.mode === '满免'" class="field">满额免上门费（元）<input v-model.number="profile.visitFee.freeAbove" type="number"/></label><text class="muted">上门费参与抽成，实际金额以订单服务端快照为准。</text></view><button class="action" @click="run(() => services.profile.serviceSettings({ radiusKm: Number(profile.radiusKm), visitFee: profile.visitFee }))">保存设置</button></template>
  <template v-else-if="mode === 'projects'"><view class="hero"><text class="hero-title">我的项目</text><text class="hero-sub">选择可接项目并设置服务价格</text></view><view v-for="item in projects" :key="item.id" class="panel project-card"><view class="project-heading row"><view class="project-info"><text class="project-name">{{ item.name }}</text><text class="muted">{{ item.category }} · {{ item.duration }} 分钟 · 平台参考 ¥{{ item.basePrice }}</text></view><switch :checked="item.enabled" color="#76A494" @change="item.enabled = switchValue($event)"/></view><label class="field project-price">我的定价（元）<input v-model.number="item.price" type="number"/></label></view><button class="action" @click="run(() => services.projects.save(projects))">保存项目</button></template>
  <template v-else><view class="panel"><LinkRow label="审核状态" path="pages/join/status"/><LinkRow label="收款账户" path="pages/bank/index"/><LinkRow label="服务协议与隐私政策" path="pages/login" hint="演示版协议入口"/></view><button class="secondary" @click="reset">重置演示数据 / 清理本地缓存</button><button class="secondary" @click="logout">退出登录</button></template>
</view></template>
<style scoped>
.mine-identity { padding: 32rpx; border: 1rpx solid #E3ECE5; border-radius: 44rpx; background: linear-gradient(120deg,#EAF3EE,#FFFFFF); box-shadow: 0 4rpx 20rpx rgba(65,100,87,.07); }
.mine-identity:active { opacity: .86; transform: scale(.99); }
.mine-person { justify-content: flex-start; }
.mine-avatar { width: 112rpx; height: 112rpx; border: 3rpx solid #FFFFFF; border-radius: 50%; flex: none; }
.avatar-fallback { display: flex; align-items: center; justify-content: center; color: #386C5D; background: #FFFFFF; font-size: 44rpx; }
.mine-copy { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: flex-start; gap: 8rpx; }
.mine-copy .hero-title { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mine-copy .tag { background: #FFFFFF; }
.mine-balance { display: flex; align-items: baseline; justify-content: space-between; gap: 16rpx; padding-top: 24rpx; margin-top: 24rpx; border-top: 1rpx solid #D6E6DE; color: #5F6863; font-size: 24rpx; }
.mine-amount { min-width: 0; text-align: right; color: #386C5D; font-size: 40rpx; line-height: 1.2; font-weight: 700; overflow-wrap: anywhere; }
.mine-section { margin: 36rpx 0 16rpx; }
.menu { padding-top: 4rpx; padding-bottom: 4rpx; }
.project-card { padding: 28rpx 32rpx; }
.project-card:active { opacity: .86; transform: scale(.99); }
.project-heading { align-items: flex-start; }
.project-info { display: flex; flex-direction: column; gap: 12rpx; flex: 1; min-width: 0; }
.project-name { font-weight: 600; }
.project-price { padding: 24rpx 0 0; margin-top: 24rpx; border-top: 1rpx solid #F0F3F1; }
.project-price input { width: 100%; min-width: 0; color: #292F2C; font-size: 30rpx; font-weight: 600; }
</style>
