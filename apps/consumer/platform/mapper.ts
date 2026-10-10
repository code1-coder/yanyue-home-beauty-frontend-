/**
 * 金额单位转换：后端统一"分"(Long)，页面 ViewModel 用"元"。
 * 订单快照和权威金额仍保存"分"。
 */
export function fenToYuan(fen: number): number {
  return fen / 100
}

export function yuanToFen(yuan: number): number {
  return Math.round(yuan * 100)
}

/**
 * 时间转换：后端时间戳毫秒；日期 yyyy-MM-dd。
 */
export function timestampToDate(ms: number): string {
  const d = new Date(ms)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function dateToTimestamp(date: string): number {
  return new Date(`${date}T00:00:00`).getTime()
}
