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

describe('provider auth adapter', () => {
  it('calls SMS login with mobile and code, then persists session', async () => {
    const mockResult = {
      userId: 77,
      accessToken: 'provider-access',
      refreshToken: 'provider-refresh',
      expiresTime: '2099-01-01T00:00:00Z',
    }
    vi.mocked(request).mockResolvedValue(mockResult)
    await auth.login('13900139000', '888888')
    expect(request).toHaveBeenCalledWith('/member/auth/sms-login', {
      method: 'POST',
      data: { mobile: '13900139000', code: '888888' },
    })
    expect(saveSession).toHaveBeenCalledWith({
      userId: 77,
      accessToken: 'provider-access',
      refreshToken: 'provider-refresh',
      expiresTime: '2099-01-01T00:00:00Z',
    })
  })

  it('clears session on logout', async () => {
    await auth.logout()
    expect(clearSession).toHaveBeenCalled()
  })

  it('returns true when session has access token', async () => {
    vi.mocked(loadSession).mockReturnValue({
      userId: 2,
      accessToken: 'provider-token',
      refreshToken: 'provider-refresh',
      expiresTime: '2099-01-01T00:00:00Z',
    })
    expect(await auth.session()).toBe(true)
  })

  it('returns false when session is missing', async () => {
    vi.mocked(loadSession).mockReturnValue(null)
    expect(await auth.session()).toBe(false)
  })
})
