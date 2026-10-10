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
  async login(phone: string, code: string): Promise<void> {
    if (!/^1\d{10}$/.test(phone) || !/^\d{6}$/.test(code))
      throw new Error('请输入 11 位手机号和 6 位验证码')
    const result = await request<AuthLoginResult>('/member/auth/sms-login', {
      method: 'POST',
      data: { mobile: phone, code }
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
