import type { AuthSession, CommonResult, PageResult } from './types'
import { clearSession, loadSession, saveSession } from './session'
import { HttpError as HttpErrorClass } from './types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

type RequestOptions = Omit<UniApp.RequestOptions, 'url'>

let refreshLock: Promise<void> | null = null

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * 统一请求封装：Bearer token、幂等键、CommonResult 解包、401 单次刷新
 */
export async function request<T = unknown>(
  url: string,
  options: RequestOptions = {},
  retryCount = 0,
): Promise<T> {
  const session = loadSession()
  const headers: Record<string, string> = { ...options.header }

  if (session?.accessToken)
    headers.Authorization = `Bearer ${session.accessToken}`

  if (options.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method.toUpperCase()))
    headers['X-Idempotent-Key'] = generateUUID()

  try {
    const res = await uni.request({
      ...options,
      url: `${API_BASE_URL}${url}`,
      header: headers,
    })

    if (res.statusCode === 401) {
      if (!session?.refreshToken || retryCount > 0) {
        clearSession()
        uni.reLaunch({ url: '/pages/login' })
        throw new HttpErrorClass('未登录或登录已过期', 401)
      }
      if (refreshLock)
        await refreshLock
      else {
        refreshLock = refreshTokenOnce(session.refreshToken).finally(() => {
          refreshLock = null
        })
        await refreshLock
      }
      return request<T>(url, options, retryCount + 1)
    }

    if (res.statusCode >= 200 && res.statusCode < 300) {
      const result = res.data as CommonResult<T>
      if (result.code === 0)
        return result.data
      throw new HttpErrorClass(result.msg || '请求失败', result.code, result)
    }

    throw new HttpErrorClass(`网络错误: ${res.statusCode}`, res.statusCode, res.data)
  }
  catch (err) {
    if (err instanceof HttpErrorClass)
      throw err
    throw new HttpErrorClass('网络连接失败', undefined, err)
  }
}

async function refreshTokenOnce(token: string): Promise<void> {
  try {
    const res = await uni.request({
      url: `${API_BASE_URL}/member/auth/refresh-token?refreshToken=${encodeURIComponent(token)}`,
      method: 'POST',
    })

    if (res.statusCode === 200) {
      const result = res.data as CommonResult<AuthSession>
      if (result.code === 0 && result.data) {
        saveSession(result.data)
        return
      }
    }
  }
  catch {}

  clearSession()
  uni.reLaunch({ url: '/pages/login' })
  throw new HttpErrorClass('登录已过期，请重新登录', 401)
}

export function unwrapPage<T>(result: CommonResult<PageResult<T>>): PageResult<T> {
  if (result.code !== 0)
    throw new HttpErrorClass(result.msg || '请求失败', result.code, result)
  return result.data
}
