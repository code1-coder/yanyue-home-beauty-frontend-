import { beforeEach, describe, expect, it, vi } from 'vitest'
import { saveSession } from '../platform/http/session'
import { restoreSession } from '../platform/guard'

const storage = new Map<string, unknown>()
const relaunch = vi.fn()
vi.stubGlobal('uni', {
  getStorageSync: (key: string) => storage.get(key),
  setStorageSync: (key: string, value: unknown) => storage.set(key, value),
  removeStorageSync: (key: string) => storage.delete(key),
  reLaunch: relaunch,
})
vi.stubGlobal('getCurrentPages', () => [{ route: 'pages/workbench/index' }])

beforeEach(() => {
  storage.clear()
  relaunch.mockClear()
})

describe('provider session guard', () => {
  it('restores a valid session', () => {
    saveSession({ userId: 1, accessToken: 'a', refreshToken: 'r', expiresTime: '2099-01-01T00:00:00Z' })
    expect(restoreSession()).toBe(true)
    expect(relaunch).not.toHaveBeenCalled()
  })

  it('redirects protected pages without a session', () => {
    expect(restoreSession()).toBe(false)
    expect(relaunch).toHaveBeenCalledWith({ url: '/pages/login' })
  })
})
