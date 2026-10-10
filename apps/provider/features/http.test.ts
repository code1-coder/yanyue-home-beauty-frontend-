import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearSession, saveSession } from '../platform/http/session'
import { request } from '../platform/http'
import { HttpError } from '../platform/http/types'

const storage = new Map<string, unknown>()
const calls: UniApp.RequestOptions[] = []
let responses: Array<{ statusCode: number; data: unknown }> = []

vi.stubGlobal('uni', {
  getStorageSync: (key: string) => storage.get(key),
  setStorageSync: (key: string, value: unknown) => storage.set(key, value),
  removeStorageSync: (key: string) => storage.delete(key),
  reLaunch: vi.fn(),
  request: (options: UniApp.RequestOptions) => {
    calls.push(options)
    return Promise.resolve(responses.shift() || { statusCode: 200, data: { code: 0, data: null, msg: '操作成功' } })
  },
})

beforeEach(() => {
  storage.clear()
  calls.length = 0
  responses = []
  vi.clearAllMocks()
})

describe('provider http', () => {
  it('adds bearer and idempotency headers and unwraps CommonResult', async () => {
    saveSession({ userId: 1, accessToken: 'access-a', refreshToken: 'refresh-a', expiresTime: '2099-01-01T00:00:00Z' })
    responses.push({ statusCode: 200, data: { code: 0, data: { id: 1 }, msg: '操作成功' } })
    await expect(request<{ id: number }>('/test', { method: 'POST', data: {} })).resolves.toEqual({ id: 1 })
    expect(calls[0].header).toMatchObject({ Authorization: 'Bearer access-a' })
    expect(calls[0].header?.['X-Idempotent-Key']).toEqual(expect.any(String))
  })

  it('refreshes once after 401 and retries the original request', async () => {
    saveSession({ userId: 1, accessToken: 'old', refreshToken: 'refresh-a', expiresTime: '2099-01-01T00:00:00Z' })
    responses.push(
      { statusCode: 401, data: {} },
      { statusCode: 200, data: { code: 0, data: { userId: 1, accessToken: 'new', refreshToken: 'new-refresh', expiresTime: '2099-01-01T00:00:00Z' }, msg: '操作成功' } },
      { statusCode: 200, data: { code: 0, data: 'ok', msg: '操作成功' } },
    )
    await expect(request<string>('/test')).resolves.toBe('ok')
    expect(calls).toHaveLength(3)
    expect(calls[1].url).toContain('/member/auth/refresh-token?refreshToken=refresh-a')
    expect(calls[2].header).toMatchObject({ Authorization: 'Bearer new' })
  })

  it('clears session and redirects when refresh fails', async () => {
    saveSession({ userId: 1, accessToken: 'old', refreshToken: 'refresh-a', expiresTime: '2099-01-01T00:00:00Z' })
    responses.push({ statusCode: 401, data: {} }, { statusCode: 200, data: { code: 1001, data: null, msg: '刷新失败' } })
    await expect(request('/test')).rejects.toBeInstanceOf(HttpError)
    expect(storage.has('yanyue-provider-session')).toBe(false)
    expect(uni.reLaunch).toHaveBeenCalledWith({ url: '/pages/login' })
  })

  it('maps non-success business responses to HttpError', async () => {
    clearSession()
    responses.push({ statusCode: 200, data: { code: 1002, data: null, msg: '无权限' } })
    await expect(request('/test')).rejects.toMatchObject({ code: 1002, message: '无权限' })
  })
})
