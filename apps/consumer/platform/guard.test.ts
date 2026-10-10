import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearSession, saveSession } from './http/session'
import { requireSession, restoreSession } from './guard'

const storage = new Map<string, unknown>()
const relaunch = vi.fn()
vi.stubGlobal('uni', {
  getStorageSync: (key: string) => storage.get(key),
  setStorageSync: (key: string, value: unknown) => storage.set(key, value),
  removeStorageSync: (key: string) => storage.delete(key),
  reLaunch: relaunch,
})
vi.stubGlobal('getCurrentPages', () => [{ route: 'pages/index/index' }])

beforeEach(() => {
  storage.clear()
  relaunch.mockClear()
})

describe('consumer session guard', () => {
  it('restores a valid session', () => {
    saveSession({ userId: 1, accessToken: 'a', refreshToken: 'r', expiresTime: '2099-01-01T00:00:00Z' })
    expect(restoreSession()).toBe(true)
    expect(relaunch).not.toHaveBeenCalled()
  })

  it('clears expired sessions and redirects protected pages', () => {
    saveSession({ userId: 1, accessToken: 'a', refreshToken: 'r', expiresTime: '2000-01-01T00:00:00Z' })
    expect(requireSession()).toBe(false)
    expect(storage.has('yanyue-consumer-session')).toBe(false)
    expect(relaunch).toHaveBeenCalledWith({ url: '/pages/login' })
  })

  it('does not redirect a login page', async () => {
    clearSession()
    vi.stubGlobal('getCurrentPages', () => [{ route: 'pages/login' }])
    expect(restoreSession()).toBe(false)
    expect(relaunch).not.toHaveBeenCalled()
    vi.stubGlobal('getCurrentPages', () => [{ route: 'pages/index/index' }])
  })
})
