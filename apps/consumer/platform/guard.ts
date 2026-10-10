import { clearSession, isTokenExpired, loadSession } from './http/session'

const publicPages = new Set(['pages/login', 'pages/launch'])

export function restoreSession(): boolean {
  const session = loadSession()
  if (session && !isTokenExpired(session.expiresTime))
    return true
  if (session)
    clearSession()

  const current = getCurrentPages().at(-1)
  const route = current?.route
  if (route && !publicPages.has(route))
    uni.reLaunch({ url: '/pages/login' })
  return false
}

export function requireSession(): boolean {
  return restoreSession()
}
