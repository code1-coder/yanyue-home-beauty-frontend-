// Cross-platform CommonResult and session definitions; do not embed business assumptions here.

export interface CommonResult<T = unknown> {
  code: number
  msg: string
  data: T
}

export interface PageResult<T = unknown> {
  total: number
  list: T[]
}

export interface AuthSession {
  userId: number
  accessToken: string
  refreshToken: string
  expiresTime: string
}

export class HttpError extends Error {
  constructor(message: string, public readonly code?: number, public readonly response?: unknown) {
    super(message)
    this.name = 'HttpError'
  }
}
