import { request } from '../platform/http'
import { clearSession, loadSession, saveSession } from '../platform/http/session'
import type { AuthSession } from '../platform/http/types'

export interface AuthLoginResult {
  userId: number
  accessToken: string
  refreshToken: string
  expiresTime: string
  openid?: string
}

function persist(result: AuthLoginResult): void {
  const session: AuthSession = {
    userId: result.userId,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    expiresTime: result.expiresTime,
  }
  saveSession(session)
}

export const auth = {
  async loginBySms(mobile: string, code: string): Promise<void> {
    if (!/^1\d{10}$/.test(mobile) || !/^\d{4,6}$/.test(code))
      throw new Error('请填写手机号及验证码')
    const result = await request<AuthLoginResult>('/member/auth/sms-login', {
      method: 'POST',
      data: { mobile, code }
    })
    persist(result)
  },

  async loginByWeixin(phoneCode: string, loginCode: string, state = 'consumer-wx-login'): Promise<void> {
    if (!phoneCode || !loginCode)
      throw new Error('微信授权信息不完整')
    const result = await request<AuthLoginResult>('/member/auth/weixin-mini-app-login', {
      method: 'POST',
      data: { phoneCode, loginCode, state },
    })
    persist(result)
  },

  async logout(): Promise<void> {
    clearSession()
  },

  async session(): Promise<boolean> {
    return Boolean(loadSession()?.accessToken)
  },
}
