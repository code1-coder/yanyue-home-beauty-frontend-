<script setup lang="ts">
import { shallowRef } from 'vue'
import { auth } from '../features/services'
import { notice, tab } from '../shared/navigation'
import DemoNotice from '../shared/components/DemoNotice.vue'

const phone = shallowRef('')
const code = shallowRef('')
const agreed = shallowRef(false)

function toggle(event: Event) {
  agreed.value = (event as unknown as { detail: { value: boolean } }).detail.value
}

async function signIn() {
  if (!agreed.value)
    return notice('请先阅读并同意协议')
  try {
    await auth.loginBySms(phone.value, code.value)
    tab('pages/index/index')
  }
  catch (error) {
    notice(error instanceof Error ? error.message : '登录失败')
  }
}

async function weixinLogin(event: { detail?: { code?: string; errMsg?: string } }) {
  if (!agreed.value)
    return notice('请先阅读并同意协议')
  const phoneCode = event.detail?.code
  if (!phoneCode)
    return notice(event.detail?.errMsg || '未获取到微信手机号授权')
  try {
    const login = await uni.login({ provider: 'weixin' })
    await auth.loginByWeixin(phoneCode, login.code)
    tab('pages/index/index')
  }
  catch (error) {
    notice(error instanceof Error ? error.message : '微信登录失败')
  }
}
</script>
<template>
  <view class="screen">
    <DemoNotice />
    <view class="section-title">手机号登录</view>
    <view class="panel">
      <input v-model="phone" class="field" type="number" maxlength="11" placeholder="手机号" />
      <input v-model="code" class="field" type="number" placeholder="短信验证码" />
    </view>
    <view class="row">
      <text>已阅读用户协议和隐私政策</text>
      <switch :checked="agreed" color="#187f70" @change="toggle" />
    </view>
    <button class="action" @click="signIn">登录</button>
    <button class="secondary" open-type="getPhoneNumber" @getphonenumber="weixinLogin">微信登录</button>
  </view>
</template>
