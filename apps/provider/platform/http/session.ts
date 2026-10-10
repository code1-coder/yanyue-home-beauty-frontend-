import type { AuthSession } from './types'

const KEY = 'yanyue-provider-session'

export function saveSession(session: AuthSession): void {
  try {
    uni.setStorageSync(KEY, JSON.stringify(session))
  } catch {
    /* Graceful degradation when storage unavailable */
  }
}

export function loadSession(): AuthSession | null {
  try {
    const raw = uni.getStorageSync(KEY)
    if (typeof raw === 'string') {
      const parsed = JSON.parse(raw) as AuthSession
      if (parsed.accessToken && parsed.refreshToken && parsed.expiresTime && parsed.userId)
        return parsed
    }
  } catch {
    /* Invalid or unavailable session */
  }
  return null
}

export function clearSession(): void {
  try {
    uni.removeStorageSync(KEY)
  } catch {
    /* Storage unavailable */
  }
}

export function isTokenExpired(expiresTime: string): boolean {
  const timestamp = new Date(expiresTime).getTime()
  return !Number.isFinite(timestamp) || timestamp <= Date.now()
}
