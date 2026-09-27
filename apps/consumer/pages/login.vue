<script setup lang="ts">
import { shallowRef } from 'vue'
import { notice, tab } from '../shared/navigation'
import DemoNotice from '../shared/components/DemoNotice.vue'
const phone = shallowRef(''), code = shallowRef(''), agreed = shallowRef(false)
function signIn() { if (!agreed.value) return notice('请先阅读并同意协议'); if (!/^1\d{10}$/.test(phone.value) || !code.value) return notice('请填写手机号及验证码'); notice('模拟登录，不进行身份验证'); tab('pages/index/index') }
function toggle(event: Event) { agreed.value = (event as unknown as { detail: { value: boolean } }).detail.value }
</script>
<template><view class="screen"><DemoNotice /><view class="section-title">手机号登录</view><view class="panel"><input v-model="phone" class="field" type="number" maxlength="11" placeholder="手机号（请勿输入真实号码）" /><input v-model="code" class="field" type="number" placeholder="验证码（模拟）" /></view><view class="row"><text>已阅读用户协议和隐私政策</text><switch :checked="agreed" color="#187f70" @change="toggle" /></view><button class="action" @click="signIn">模拟登录</button><button class="secondary" @click="notice('微信授权待正式接入')">微信登录（待接入）</button></view></template>
