import { beforeEach, describe, expect, it, vi } from 'vitest'
import { auth } from './auth'
import { request } from '../platform/http'
import { clearSession, loadSession, saveSession } from '../platform/http/session'

vi.mock('../platform/http', () => ({
  request: vi.fn(),
}))

vi.mock('../platform/http/session', () => ({
  saveSession: vi.fn(),
  clearSession: vi.fn(),
  loadSession: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('consumer auth adapter', () => {
  it('calls SMS login with mobile and code, then persists session', async () => {
    const mockResult = {
      userId: 42,
      accessToken: 'test-access',
      refreshToken: 'test-refresh',
      expiresTime: '2099-01-01T00:00:00Z',
    }
    vi.mocked(request).mockResolvedValue(mockResult)
    await auth.loginBySms('13800138000', '1234')
    expect(request).toHaveBeenCalledWith('/member/auth/sms-login', {
      method: 'POST',
      data: { mobile: '13800138000', code: '1234' },
    })
    expect(saveSession).toHaveBeenCalledWith({
      userId: 42,
      accessToken: 'test-access',
      refreshToken: 'test-refresh',
      expiresTime: '2099-01-01T00:00:00Z',
    })
  })

  it('calls Weixin mini-app login with phoneCode, loginCode, and state', async () => {
    const mockResult = {
      userId: 100,
      accessToken: 'weixin-access',
      refreshToken: 'weixin-refresh',
      expiresTime: '2099-01-01T00:00:00Z',
      openid: 'wx-open-id',
    }
    vi.mocked(request).mockResolvedValue(mockResult)
    await auth.loginByWeixin('phone-code', 'login-code', 'state-value')
    expect(request).toHaveBeenCalledWith('/member/auth/weixin-mini-app-login', {
      method: 'POST',
      data: { phoneCode: 'phone-code', loginCode: 'login-code', state: 'state-value' },
    })
    expect(saveSession).toHaveBeenCalledWith({
      userId: 100,
      accessToken: 'weixin-access',
      refreshToken: 'weixin-refresh',
      expiresTime: '2099-01-01T00:00:00Z',
    })
  })

  it('clears session on logout', async () => {
    await auth.logout()
    expect(clearSession).toHaveBeenCalled()
  })

  it('returns true when session has access token', async () => {
    vi.mocked(loadSession).mockReturnValue({
      userId: 1,
      accessToken: 'valid-token',
      refreshToken: 'valid-refresh',
      expiresTime: '2099-01-01T00:00:00Z',
    })
    expect(await auth.session()).toBe(true)
  })

  it('returns false when session is missing', async () => {
    vi.mocked(loadSession).mockReturnValue(null)
    expect(await auth.session()).toBe(false)
  })
})
