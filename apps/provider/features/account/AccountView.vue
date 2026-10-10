<script setup lang="ts">
import { onMounted, reactive, ref, shallowRef } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { services } from '../services'
import type { Qualification, PayoutAccount } from '../types'
import type { OnboardingInput } from '../contracts'
import { go, inputValue, run, toast } from '../../shared/navigation'
import { selectImage } from '../../platform/media'
import DemoBanner from '../../shared/components/DemoBanner.vue'
const props = defineProps<{ mode: 'login' | 'apply' | 'status' }>()
const phone = shallowRef(''), code = shallowRef(''), agreed = shallowRef(false)
const profile = reactive<OnboardingInput>({ realName: '', identityFront: '', identityBack: '', businessName: '' })
const account = reactive<Pick<PayoutAccount, 'type' | 'name' | 'masked'>>({ type: '银行卡', name: '', masked: '' })
const qualifications = ref<Qualification[]>([])
const reviewStatus = shallowRef('待提交'), rejectionReason = shallowRef('')
async function refresh() { if (props.mode !== 'login') { const result = await services.onboarding.get(); profile.realName = result.provider.realName; profile.identityFront = result.provider.identityFront; profile.identityBack = result.provider.identityBack; profile.businessName = result.provider.businessName; reviewStatus.value = result.provider.reviewStatus; rejectionReason.value = result.provider.rejectionReason; qualifications.value = result.qualifications; const accounts = await services.finance.accounts(); const selected = accounts.find(item => item.isDefault); if (selected) Object.assign(account, { type: selected.type, name: selected.name, masked: selected.masked }) } }
onShow(refresh)
onMounted(refresh)
async function photo(field: 'identityFront' | 'identityBack') { try { profile[field] = await selectImage() } catch { toast('未选择图片') } }
async function credential(id: string) { try { const file = await selectImage(); qualifications.value = qualifications.value.map(q => q.id === id ? { ...q, file } : q) } catch { toast('未选择图片') } }
async function login() { if (!agreed.value) return toast('请先同意服务协议'); if (await run(() => services.auth.login(phone.value, code.value), '登录成功')) go('pages/workbench/index') }
async function submit() { if (await run(() => services.onboarding.submit(profile, qualifications.value.map(({ id, file, expires }) => ({ id, file, expires })), account), '资料已提交，等待审核')) go('pages/join/status') }
</script>
<template><view class="screen"><DemoBanner />
  <template v-if="mode === 'login'"><view class="hero"><text class="hero-title">服务者登录</text><text class="hero-sub">管理预约、排班与收益</text></view><view class="panel"><label class="field">手机号<input v-model="phone" type="number" maxlength="11" placeholder="请输入手机号"/></label><label class="field">验证码<input v-model="code" type="number" maxlength="6" placeholder="短信验证码"/></label><view class="row"><checkbox :checked="agreed" @click="agreed = !agreed"/><text class="muted">同意服务协议与隐私政策</text></view><button class="action" @click="login">登录</button></view><button class="secondary" @click="go('pages/join/apply')">申请入驻</button></template>
  <template v-else-if="mode === 'apply'"><text class="section-title">实名与主体资料</text><view class="panel"><label class="field">真实姓名<input v-model="profile.realName" placeholder="请输入真实姓名"/></label><label class="field">主体名称（个体户）<input v-model="profile.businessName" placeholder="个体户或工作室名称"/></label><view class="row"><text>身份证正面</text><button size="mini" @click="photo('identityFront')">{{ profile.identityFront ? '已选择 · 更换' : '选择图片' }}</button></view><view class="row"><text>身份证反面</text><button size="mini" @click="photo('identityBack')">{{ profile.identityBack ? '已选择 · 更换' : '选择图片' }}</button></view></view><text class="section-title">资质证件</text><view v-for="item in qualifications" :key="item.id" class="panel"><view class="row"><text>{{ item.name }}</text><button size="mini" @click="credential(item.id)">{{ item.file ? '已选择 · 更换' : '上传图片' }}</button></view><view class="field">有效期<picker mode="date" :value="item.expires" @change="item.expires = inputValue($event)"><view class="picker">{{ item.expires || '选择有效期' }}</view></picker></view></view><text class="section-title">收款账户</text><view class="panel"><view class="chips"><view v-for="type in ['银行卡', '支付宝', '微信']" :key="type" class="chip" :class="{ active: account.type === type }" @click="account.type = type as PayoutAccount['type']">{{ type }}</view></view><label class="field">账户姓名<input v-model="account.name" placeholder="演示姓名"/></label><label class="field">账户标识<input v-model="account.masked" placeholder="仅填演示尾号或标识"/></label><text class="muted">请勿输入真实收款账户信息。</text></view><button class="action" @click="submit">提交审核</button></template>
  <template v-else><view class="hero"><text class="hero-title">{{ reviewStatus }}</text><text class="hero-sub">入驻与资质由平台审核，演示端不能自行通过</text></view><view v-if="rejectionReason" class="panel danger">驳回原因：{{ rejectionReason }}</view><view class="panel">{{ reviewStatus === '通过' ? '可继续设置服务与排班' : '提交后请等待审核结果' }}</view><button v-if="reviewStatus === '驳回' || reviewStatus === '待提交'" class="action" @click="go('pages/join/apply')">重新提交</button><button class="secondary" @click="go('pages/mine/qualification')">查看资质</button><button class="secondary" @click="go('pages/workbench/index')">返回工作台</button></template>
</view></template>
