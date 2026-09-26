export function go(path: string, query: Record<string, string> = {}) {
  const params = Object.entries(query).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&')
  const url = `/${path}${params ? `?${params}` : ''}`
  uni.navigateTo({ url })
}
export function tab(path: string) { uni.switchTab({ url: `/${path}` }) }
export function notice(title: string) { uni.showToast({ title, icon: 'none' }) }
export function showDemoLimit() { notice('演示数据，正式接口待接入') }
